select set_config('desk.actor','Fictional demo seed',true);
insert into workspace(id,name) values('00000000-0000-4000-8000-000000000001','Harbour Reporting Demo') on conflict do nothing;
insert into cycles(id,name,period_end,deadline,retain_until) values
('10000000-0000-4000-8000-000000000001','September management report',current_date-20,current_date+7,(current_date+interval '8 years')::date),
('10000000-0000-4000-8000-000000000002','Prior quarter review',current_date-110,current_date-60,current_date+30) on conflict do nothing;
insert into items(id,cycle_id,reference,title,owner,due,narrative) values
('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','REV-01','Revenue commentary','Aroha',current_date-3,'Revenue is subject to the open reconciliation.'),
('20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','CASH-01','Cash movement','Ben',current_date+2,'Cash agrees with the bank reconciliation.'),
('20000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000001','DEBT-01','Debt note','Aroha',current_date-1,'Waiting for the supporting schedule.'),
('20000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000002','PRIOR-01','Prior period note','Ben',current_date-65,'Retention needs review.') on conflict do nothing;
insert into facts(id,cycle_id,code,label,value,unit,evidence_ref,observed_on) values
('30000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','REV-LEDGER','Ledger revenue',452300,'NZD','demo:ledger/sep',current_date-20),
('30000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','REV-SCHEDULE','Revenue schedule',450800,'NZD','',current_date-25),
('30000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000001','CASH-LEDGER','Ledger cash',80310.25,'NZD','demo:cash/sep',current_date-20),
('30000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000001','CASH-BANK','Bank reconciliation',80310.25,'NZD','demo:bank/sep',current_date-20) on conflict do nothing;
insert into item_facts(item_id,fact_id) values
('20000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001'),
('20000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000002'),
('20000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000003'),
('20000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000004') on conflict do nothing;
insert into tieouts(cycle_id,name,left_id,right_id) values
('10000000-0000-4000-8000-000000000001','Revenue agreement','30000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000002'),
('10000000-0000-4000-8000-000000000001','Cash agreement','30000000-0000-4000-8000-000000000003','30000000-0000-4000-8000-000000000004') on conflict do nothing;
insert into tasks(id,item_id,title,owner,due) values
('40000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','Reconcile revenue difference','Aroha',current_date-2) on conflict do nothing;
