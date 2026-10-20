create table workspace (
 id uuid primary key default gen_random_uuid(), name text not null check (btrim(name) <> ''),
 singleton boolean not null default true unique check(singleton),
 created_at timestamptz not null default clock_timestamp(), updated_at timestamptz not null default clock_timestamp()
);
create table cycles (
 id uuid primary key default gen_random_uuid(), name text not null unique check(btrim(name) <> ''),
 period_end date not null, deadline date not null, retain_until date,
 status text not null default 'open' check(status in ('open','closed')),
 created_at timestamptz not null default clock_timestamp(), updated_at timestamptz not null default clock_timestamp(),
 check(deadline >= period_end)
);
create table items (
 id uuid primary key default gen_random_uuid(), cycle_id uuid not null references cycles(id),
 reference text not null check(btrim(reference) <> ''), title text not null check(btrim(title) <> ''),
 owner text not null check(btrim(owner) <> ''), due date not null, narrative text not null default '',
 revision integer not null default 1 check(revision > 0),
 created_at timestamptz not null default clock_timestamp(), updated_at timestamptz not null default clock_timestamp(), unique(cycle_id,reference)
);
create table facts (
 id uuid primary key default gen_random_uuid(), cycle_id uuid not null references cycles(id),
 code text not null check(btrim(code) <> ''), label text not null check(btrim(label) <> ''),
 value numeric(20,4) not null check(value <> 'NaN'::numeric), unit text not null check(btrim(unit) <> ''),
 evidence_ref text not null default '', observed_on date not null,
 created_at timestamptz not null default clock_timestamp(), updated_at timestamptz not null default clock_timestamp(), unique(cycle_id,code)
);
create table item_facts (
 id uuid primary key default gen_random_uuid(), item_id uuid not null references items(id), fact_id uuid not null references facts(id),
 created_at timestamptz not null default clock_timestamp(), updated_at timestamptz not null default clock_timestamp(), unique(item_id,fact_id)
);
create index item_facts_fact_idx on item_facts(fact_id);
create table tieouts (
 id uuid primary key default gen_random_uuid(), cycle_id uuid not null references cycles(id),
 name text not null check(btrim(name) <> ''), left_id uuid not null references facts(id), right_id uuid not null references facts(id),
 tolerance numeric(20,4) not null default 0 check(tolerance >= 0 and tolerance <> 'NaN'::numeric),
 created_at timestamptz not null default clock_timestamp(), updated_at timestamptz not null default clock_timestamp(),
 unique(cycle_id,name), check(left_id <> right_id)
);
create index tieouts_left_idx on tieouts(left_id);
create index tieouts_right_idx on tieouts(right_id);
create table signoffs (
 id uuid primary key default gen_random_uuid(), item_id uuid not null references items(id), revision integer not null,
 decision text not null check(decision in ('approved','returned')), actor text not null check(btrim(actor) <> ''),
 evidence_ref text not null check(btrim(evidence_ref) <> ''),
 created_at timestamptz not null default clock_timestamp(), updated_at timestamptz not null default clock_timestamp()
);
create index signoffs_item_idx on signoffs(item_id,created_at desc);
create table tasks (
 id uuid primary key default gen_random_uuid(), item_id uuid not null references items(id),
 title text not null check(btrim(title) <> ''), owner text not null check(btrim(owner) <> ''), due date not null,
 completed_at timestamptz,
 created_at timestamptz not null default clock_timestamp(), updated_at timestamptz not null default clock_timestamp()
);
create index tasks_item_idx on tasks(item_id);
create index tasks_open_due_idx on tasks(due) where completed_at is null;
create table audit_events (
 id uuid primary key default gen_random_uuid(), entity text not null, record_id uuid not null,
 action text not null, actor text not null, before_record jsonb, after_record jsonb,
 created_at timestamptz not null default clock_timestamp(), updated_at timestamptz not null default clock_timestamp()
);
create index audit_record_idx on audit_events(record_id,created_at);

create function touch_record() returns trigger language plpgsql as $$
begin
 new.updated_at = clock_timestamp();
 if tg_table_name = 'items' then new.revision = old.revision + 1; end if;
 return new;
end $$;
create function record_audit() returns trigger language plpgsql as $$
declare who text := current_setting('desk.actor',true);
begin
 if coalesce(btrim(who),'') = '' then raise exception 'An actor is required'; end if;
 insert into audit_events(entity,record_id,action,actor,before_record,after_record)
 values(tg_table_name,coalesce(new.id,old.id),tg_op,who,
 case when tg_op <> 'INSERT' then to_jsonb(old) end,
 case when tg_op <> 'DELETE' then to_jsonb(new) end);
 return coalesce(new,old);
end $$;
create function append_only() returns trigger language plpgsql as $$
begin raise exception 'This record is append-only'; end $$;
create trigger audit_immutable before update or delete on audit_events for each row execute function append_only();
create trigger signoffs_immutable before update or delete on signoffs for each row execute function append_only();

create function guard_cycle() returns trigger language plpgsql as $$
declare cid uuid; st text;
begin
 if tg_table_name = 'cycles' then
  if old.status = 'closed' then raise exception 'Reporting cycle is closed'; end if;
  return new;
 elsif tg_table_name in ('items','facts','tieouts') then cid = new.cycle_id;
 else select cycle_id into cid from items where id = new.item_id; end if;
 select status into st from cycles where id=cid for update;
 if st = 'closed' then raise exception 'Reporting cycle is closed'; end if;
 return new;
end $$;
create function check_link() returns trigger language plpgsql as $$
begin
 if (select cycle_id from items where id=new.item_id) <> (select cycle_id from facts where id=new.fact_id) then
 raise exception 'Cannot link different reporting cycles'; end if;
 return new;
end $$;
create trigger link_check before insert or update on item_facts for each row execute function check_link();
create function check_tieout() returns trigger language plpgsql as $$
begin
 if not exists(select 1 from facts a, facts b where a.id=new.left_id and b.id=new.right_id
 and a.cycle_id=new.cycle_id and b.cycle_id=new.cycle_id and a.unit=b.unit) then
 raise exception 'Tie-out requires the same cycle and unit'; end if;
 return new;
end $$;
create trigger tieout_check before insert or update on tieouts for each row execute function check_tieout();
create function invalidate_fact_users() returns trigger language plpgsql as $$
begin
 if tg_table_name = 'facts' then
  update items set revision=revision where id in(select item_id from item_facts where fact_id=new.id);
 elsif tg_table_name = 'item_facts' then
  update items set revision=revision where id=new.item_id;
 else
  update items set revision=revision where cycle_id=new.cycle_id;
 end if;
 return new;
end $$;
create trigger fact_changed after update on facts for each row execute function invalidate_fact_users();
create trigger link_changed after insert or update on item_facts for each row execute function invalidate_fact_users();
create trigger tieout_changed after insert or update on tieouts for each row execute function invalidate_fact_users();

do $$ declare t text; begin
 foreach t in array array['workspace','cycles','items','facts','item_facts','tieouts','tasks'] loop
 execute format('create trigger touch before update on %I for each row execute function touch_record()',t);
 end loop;
 foreach t in array array['workspace','cycles','items','facts','item_facts','tieouts','tasks','signoffs'] loop
 execute format('create trigger audit after insert or update or delete on %I for each row execute function record_audit()',t);
 execute format('create trigger no_delete before delete on %I for each row execute function append_only()',t);
 end loop;
 foreach t in array array['items','facts','item_facts','tieouts','tasks','signoffs'] loop
 execute format('create trigger cycle_guard before insert or update on %I for each row execute function guard_cycle()',t);
 end loop;
 end $$;
create trigger cycle_guard before update on cycles for each row execute function guard_cycle();

create view v_tieouts with (security_invoker=true) as
 select t.id,t.cycle_id,c.name cycle,t.name,a.code left_code,b.code right_code,a.unit,
 a.value::text left_value,b.value::text right_value,(a.value-b.value)::text difference,t.tolerance::text tolerance,
 (a.unit=b.unit and abs(a.value-b.value)<=t.tolerance) passed
 from tieouts t join facts a on a.id=t.left_id join facts b on b.id=t.right_id join cycles c on c.id=t.cycle_id;
create view v_evidence_gaps with (security_invoker=true) as
 select f.id,f.cycle_id,c.name cycle,f.code,f.label,f.evidence_ref,f.observed_on,
 case when btrim(f.evidence_ref)='' then 'Missing evidence' else 'Before period end' end issue
 from facts f join cycles c on c.id=f.cycle_id
 where btrim(f.evidence_ref)='' or f.observed_on<c.period_end;
create view v_reporting with (security_invoker=true) as
 select i.id,i.cycle_id,c.name cycle,c.status cycle_status,i.reference,i.title,i.owner,i.due,i.revision,
 (select count(*)::int from item_facts l where l.item_id=i.id) facts,
 (select count(*)::int from item_facts l join v_evidence_gaps g on g.id=l.fact_id where l.item_id=i.id) evidence_gaps,
 (select count(*)::int from v_tieouts t where t.cycle_id=i.cycle_id and not t.passed) failed_tieouts,
 (select count(*)::int from tasks t where t.item_id=i.id and t.completed_at is null) open_tasks,
 coalesce(s.decision,'pending') last_decision,s.revision signed_revision,
 (s.decision='approved' and s.revision=i.revision) is_signed
 from items i join cycles c on c.id=i.cycle_id
 left join lateral(select decision,revision from signoffs where item_id=i.id order by created_at desc,id desc limit 1) s on true;
create view v_attention with (security_invoker=true) as
 select reference,title,owner,due,case
 when facts=0 then 'No supporting figures'
 when evidence_gaps>0 then 'Evidence needs checking'
 when failed_tieouts>0 then 'Reconciliation failed'
 when open_tasks>0 then 'Open follow-up'
 when not coalesce(is_signed,false) then 'Sign-off required'
 else 'Ready' end issue
 from v_reporting where cycle_status='open' and (due<current_date or facts=0 or evidence_gaps>0 or failed_tieouts>0 or open_tasks>0 or not coalesce(is_signed,false));

-- Private operator database. No public API policies or grants.
do $$ declare t text; begin
 foreach t in array array['workspace','cycles','items','facts','item_facts','tieouts','tasks','signoffs','audit_events'] loop
 execute format('alter table %I enable row level security',t);
 execute format('revoke all on %I from public',t);
 end loop;
end $$;
revoke all on v_tieouts,v_evidence_gaps,v_reporting,v_attention from public;
