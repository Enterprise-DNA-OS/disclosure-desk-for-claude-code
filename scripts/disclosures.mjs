#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { getDb, REPO_ROOT } from './lib/db.mjs';
import { parseCsv } from './lib/csv.mjs';
import { table } from './lib/format.mjs';

export const commands = ['init','cycles','add-cycle','cycle','add-item','items','show','revise','facts','add-fact','set-fact','link','add-tieout','tie-outs','signoff','log','tasks','complete-task','reporting-cycle','evidence-gaps','signoffs-due','attention','compliance','insights','history','import','export','draft-report','weekly-review','close-cycle'];
const writes = new Set(['init','add-cycle','add-item','revise','add-fact','set-fact','link','add-tieout','signoff','log','complete-task','import','close-cycle']);
const tables = ['workspace','cycles','items','facts','item_facts','tieouts','signoffs','tasks','audit_events'];
const required = (v, label) => { if(typeof v!=='string'||!v.trim()) throw Error(`${label} is required`); return v.trim(); };
const date = (v,label) => { required(v,label); if(!/^\d{4}-\d{2}-\d{2}$/.test(v)||!Number.isFinite(Date.parse(v))||new Date(v).toISOString().slice(0,10)!==v) throw Error(`${label} must be a valid YYYY-MM-DD date`); return v; };
const decimal = v => { if(!/^-?\d{1,16}(\.\d{1,4})?$/.test(String(v))) throw Error('Value must be an exact decimal, at most 16 integer and 4 decimal places'); return String(v); };
const today=()=>new Date().toISOString().slice(0,10);
function parse(argv) {
 const options={}, args=[];
 for(const arg of argv) {
  if(arg.startsWith('--')) { const p=arg.indexOf('='); const key=arg.slice(2,p<0?undefined:p); if(Object.hasOwn(options,key)) throw Error(`Duplicate option --${key}`); options[key]=p<0?true:arg.slice(p+1); }
  else args.push(arg);
 }
 return {args,options};
}
const fields={cycles:['name'],items:['reference','title'],facts:['code','label'],tasks:['title']};
async function resolve(db,type,value,cycleId=null) {
 required(value,`${type} identifier`);
 const rows=await db.query(`select * from ${type} where (id::text ilike $1 or ${fields[type].map(f=>`lower(${f})=lower($2)`).join(' or ')}) ${cycleId?'and cycle_id=$3':''} order by id`,cycleId?[value+'%',value,cycleId]:[value+'%',value]);
 if(rows.length!==1) throw Error(rows.length?`Ambiguous ${type}: ${JSON.stringify(rows.map(r=>({id:r.id,name:r.name||r.reference||r.code||r.title})))}`:`No ${type} matches ${value}`);
 return rows[0];
}
async function sourceFact(db,row,cycleId,update=false) {
 const code=required(row.code,'code'), label=required(row.label,'label'), value=decimal(row.value),unit=required(row.unit,'unit'), observed=date(row.observed_on,'observed_on');
 if(observed>today()) throw Error('Evidence date cannot be in the future');
 const evidence=row.evidence_ref||'';
 const old=(await db.query('select * from facts where cycle_id=$1 and code=$2',[cycleId,code]))[0];
 if(old) {
  const equal=(await db.query('select value=$1::numeric and label=$2 and unit=$3 and evidence_ref=$4 and observed_on=$5::date same from facts where id=$6',[value,label,unit,evidence,observed,old.id]))[0].same;
  if(equal) return {action:'skipped',id:old.id,code};
  if(!update) throw Error(`Changed fact ${code}: reconcile it, then use --update`);
  if(old.unit!==unit) throw Error(`Unit change for ${code} requires a new fact code`);
  await db.query('update facts set label=$1,value=$2,evidence_ref=$3,observed_on=$4 where id=$5',[label,value,evidence,observed,old.id]);
  return {action:'updated',id:old.id,code};
 }
 const r=(await db.query('insert into facts(cycle_id,code,label,value,unit,evidence_ref,observed_on) values($1,$2,$3,$4,$5,$6,$7) returning id',[cycleId,code,label,value,unit,evidence,observed]))[0];
 return {action:'inserted',id:r.id,code};
}
export const questions=[
 'Which overdue disclosures still need sign-off?',
 'Which owners have open follow-ups past their due dates?',
 'Which figures have no evidence reference?',
 'Which figures rely on evidence before the reporting period end?',
 'Which reconciliations disagree beyond their tolerance?',
 'Which disclosures changed after their last approval?',
 'Which disclosures have no supporting figures?',
 'Which figures are reused across several disclosures?',
 'Which reporting cycles have a short or missing retention date?',
 'Which disclosures are ready for an independent reviewer?'
];
const insightSql=[
 "select reference,title,owner,due from v_reporting where cycle_status='open' and due<current_date and not coalesce(is_signed,false) order by due",
 "select t.title,t.owner,t.due,i.reference from tasks t join items i on i.id=t.item_id where t.completed_at is null and t.due<current_date order by t.due",
 "select code,label,cycle from v_evidence_gaps where evidence_ref='' order by code",
 'select f.code,f.observed_on,c.period_end from facts f join cycles c on c.id=f.cycle_id where f.observed_on<c.period_end order by f.code',
 'select name,cycle,difference,unit,tolerance from v_tieouts where not passed order by name',
 "select r.reference,r.revision,r.signed_revision from v_reporting r where r.last_decision='approved' and r.revision<>r.signed_revision order by r.reference",
 'select reference,title,owner from v_reporting where facts=0 order by reference',
 'select f.code,f.label,count(*)::int disclosures from facts f join item_facts l on l.fact_id=f.id group by f.id having count(*)>1 order by f.code',
 "select name,period_end,retain_until from cycles where retain_until is null or retain_until<(period_end+interval '7 years')::date order by name",
 "select reference,title,owner from v_reporting where cycle_status='open' and facts>0 and evidence_gaps=0 and failed_tieouts=0 and open_tasks=0 and not coalesce(is_signed,false) order by reference"
];
export function display(data) {
 if(Array.isArray(data)) {
  if(!data.length) return '  (none)';
  const rows=data.map(r=>Object.fromEntries(Object.entries(r).map(([k,v])=>[k,v&&typeof v==='object'?JSON.stringify(v):v])));
  return table(rows,Object.keys(rows[0]).map(key=>({key,label:key.replaceAll('_',' ')})));
 }
 if(data&&typeof data==='object') return Object.entries(data).map(([k,v])=>`${k}\n${typeof v==='object'?display(v):v}`).join('\n\n');
 return String(data);
}
function writePrivate(dir,ext,text) {
 const root=path.resolve(process.env.OUTPUT_DIR||REPO_ROOT,dir); fs.mkdirSync(root,{recursive:true,mode:0o700});
 const file=path.join(root,`${new Date().toISOString().replace(/[:.]/g,'-')}-${randomUUID()}.${ext}`);
 fs.writeFileSync(file,text,{mode:0o600,flag:'wx'}); return file;
}
export async function run(db,argv) {
 const {args,options:o}=parse(argv), [cmd,...a]=args;
 if(!cmd||cmd==='help'||o.help) return {commands};
 if(!commands.includes(cmd)) throw Error(`Unknown command ${cmd}. Use help.`);
 const allowed=new Set(['json','actor','cycle','period-end','deadline','retain-until','owner','due','narrative','value','unit','evidence','observed-on','tolerance','decision','map','dry-run','update','all']);
 for(const k of Object.keys(o)) if(!allowed.has(k)) throw Error(`Unknown option --${k}`);
 if(writes.has(cmd)) required(o.actor,'--actor');
 await db.exec(writes.has(cmd)?'BEGIN':'BEGIN READ ONLY');
 try {
  if(writes.has(cmd)) {
   await db.query("select set_config('desk.actor',$1,true)",[o.actor]);
   if(cmd!=='init') {
    if(!(await db.query('select id from workspace')).length) throw Error('Run init before recording business data');
    // Serializes operator writes and cross-record checks, including imports.
    await db.query('select id from workspace for update');
   }
  }
  let result;
  const cy=async(value=o.cycle)=>resolve(db,'cycles',value);
  switch(cmd) {
   case 'init': result=await db.query('insert into workspace(name) values($1) returning id,name',[required(a[0],'Business name')]);break;
   case 'cycles': result=await db.query('select id,name,period_end,deadline,retain_until,status from cycles order by deadline');break;
   case 'add-cycle': result=await db.query('insert into cycles(name,period_end,deadline,retain_until) values($1,$2,$3,$4) returning *',[required(a[0],'Cycle name'),date(o['period-end'],'--period-end'),date(o.deadline,'--deadline'),o['retain-until']?date(o['retain-until'],'--retain-until'):null]);break;
   case 'cycle': { const c=await cy(a[0]); result={cycle:[c],disclosures:await db.query('select * from v_reporting where cycle_id=$1 order by reference',[c.id])};break; }
   case 'add-item': {const c=await cy();result=await db.query('insert into items(cycle_id,reference,title,owner,due,narrative) values($1,$2,$3,$4,$5,$6) returning *',[c.id,required(a[0],'Reference'),required(a[1],'Title'),required(o.owner,'--owner'),date(o.due,'--due'),o.narrative||'']);break;}
   case 'items': result=await db.query('select id,cycle,reference,title,owner,due,revision from v_reporting order by due,reference');break;
   case 'show': {const i=await resolve(db,'items',a[0]); result={disclosure:[i],facts:await db.query('select f.* from facts f join item_facts l on l.fact_id=f.id where l.item_id=$1 order by f.code',[i.id]),signoffs:await db.query('select * from signoffs where item_id=$1 order by created_at',[i.id]),tasks:await db.query('select * from tasks where item_id=$1 order by due',[i.id])}; break;}
   case 'revise': {const i=await resolve(db,'items',a[0]);result=await db.query('update items set narrative=$1,owner=$2,due=$3 where id=$4 returning *',[required(o.narrative,'--narrative'),o.owner?required(o.owner,'--owner'):i.owner,o.due?date(o.due,'--due'):i.due,i.id]);break;}
   case 'facts': result=await db.query('select f.id,c.name cycle,f.code,f.label,f.value::text value,f.unit,f.evidence_ref,f.observed_on from facts f join cycles c on c.id=f.cycle_id order by c.name,f.code');break;
   case 'add-fact': {const c=await cy();result=[await sourceFact(db,{code:a[0],label:a[1],value:o.value,unit:o.unit,evidence_ref:o.evidence,observed_on:o['observed-on']},c.id)];break;}
   case 'set-fact': {const f=await resolve(db,'facts',a[0]);result=[await sourceFact(db,{...f,value:o.value===undefined?String(f.value):o.value,evidence_ref:o.evidence===undefined?f.evidence_ref:o.evidence,observed_on:o['observed-on']===undefined?f.observed_on:o['observed-on']},f.cycle_id,true)];break;}
   case 'link': {const i=await resolve(db,'items',a[0]),f=await resolve(db,'facts',a[1],i.cycle_id);result=await db.query('insert into item_facts(item_id,fact_id) values($1,$2) on conflict do nothing returning *',[i.id,f.id]);break;}
   case 'add-tieout': {const c=await cy(),l=await resolve(db,'facts',a[1],c.id),r=await resolve(db,'facts',a[2],c.id);result=await db.query('insert into tieouts(cycle_id,name,left_id,right_id,tolerance) values($1,$2,$3,$4,$5) returning *',[c.id,required(a[0],'Name'),l.id,r.id,decimal(o.tolerance||'0')]);break;}
   case 'tie-outs': result=await db.query('select cycle,name,left_value,right_value,difference,unit,tolerance,passed from v_tieouts order by cycle,name');break;
   case 'signoff': {
    const i=await resolve(db,'items',a[0]); const decision=required(o.decision,'--decision');
    if(!['approved','returned'].includes(decision)) throw Error('Decision must be approved or returned');
    if(i.owner.toLowerCase()===o.actor.trim().toLowerCase()) throw Error('Reviewer must differ from the disclosure owner');
    if(decision==='approved') {
     const r=(await db.query('select * from v_reporting where id=$1',[i.id]))[0];
     if(!i.narrative.trim()||r.facts===0||r.evidence_gaps>0||r.failed_tieouts>0||r.open_tasks>0) throw Error('Resolve narrative, evidence, tie-outs and open tasks before approval');
    }
    result=await db.query('insert into signoffs(item_id,revision,decision,actor,evidence_ref) values($1,$2,$3,$4,$5) returning *',[i.id,i.revision,decision,o.actor.trim(),required(o.evidence,'--evidence')]);break;
   }
   case 'log': {const i=await resolve(db,'items',a[0]); result=await db.query('insert into tasks(item_id,title,owner,due) values($1,$2,$3,$4) returning *',[i.id,required(a[1],'Follow-up'),required(o.owner,'--owner'),date(o.due,'--due')]);break;}
   case 'tasks': result=await db.query(`select t.id,i.reference,t.title,t.owner,t.due,t.completed_at from tasks t join items i on i.id=t.item_id ${o.all?'':'where t.completed_at is null'} order by t.due`);break;
   case 'complete-task': {const t=await resolve(db,'tasks',a[0]);if(t.completed_at) throw Error('Task already complete');result=await db.query('update tasks set completed_at=clock_timestamp() where id=$1 returning *',[t.id]);break;}
   case 'reporting-cycle': result=await db.query('select cycle,reference,owner,due,facts,evidence_gaps,failed_tieouts,open_tasks,coalesce(is_signed,false) signed from v_reporting order by due,reference');break;
   case 'evidence-gaps': result=await db.query('select cycle,code,label,observed_on,issue from v_evidence_gaps order by cycle,code');break;
   case 'signoffs-due': result=await db.query("select cycle,reference,owner,due,revision,signed_revision from v_reporting where cycle_status='open' and not coalesce(is_signed,false) order by due,reference");break;
   case 'attention': result=await db.query('select * from v_attention order by due,reference');break;
   case 'compliance': result={retention_review:await db.query(insightSql[8]),evidence_checks:await db.query('select cycle,code,issue from v_evidence_gaps order by cycle,code'),review_controls:await db.query('select * from v_attention order by due,reference'),basis:'NZ company record-retention screen and internal reporting controls. See docs/compliance.md. No filing or compliance certification.'};break;
   case 'insights': result={};for(let n=0;n<questions.length;n++) result[questions[n]]=await db.query(insightSql[n]);break;
   case 'history': result=await db.query('select entity,record_id,action,actor,created_at from audit_events order by created_at,id');break;
   case 'import': {
    if(a[0]!=='workiva') throw Error('Use import workiva <CSV> --cycle=<cycle>');
    const c=await cy();required(a[1],'CSV path'); const records=parseCsv(fs.readFileSync(a[1],'utf8'));
    if(!records.length) throw Error('CSV has no rows');
    const map=o.map?JSON.parse(fs.readFileSync(required(o.map,'--map'),'utf8')):{code:'Code',label:'Label',value:'Value',unit:'Unit',evidence_ref:'Evidence',observed_on:'Observed on'};
    const keys=['code','label','value','unit','evidence_ref','observed_on'];
    if(Object.keys(map).length!==keys.length||keys.some(k=>typeof map[k]!=='string'||!Object.hasOwn(records[0],map[k]))) throw Error('Map must name all six canonical fields and existing CSV headers');
    const seen=new Set();result=[];
    for(let n=0;n<records.length;n++) {
     const row=Object.fromEntries(keys.map(k=>[k,records[n][map[k]].trim()]));
     if(seen.has(row.code)) throw Error(`Duplicate code at row ${n+2}: ${row.code}`); seen.add(row.code);
     try {result.push(await sourceFact(db,row,c.id,Boolean(o.update)));}catch(e){throw Error(`CSV row ${n+2}: ${e.message}`);}
    }
    result={dry_run:Boolean(o['dry-run']),rows:result};break;
   }
   case 'export': {
    const records={}; for(const t of tables) records[t]=await db.query(`select * from ${t} order by id`);
    const archive={format:'disclosure-desk-v1',exported_at:new Date().toISOString(),records};
    result={file:writePrivate('exports','json',JSON.stringify(archive,null,2)),counts:Object.fromEntries(Object.entries(records).map(([k,v])=>[k,v.length]))};break;
   }
   case 'draft-report': {
    const c=await cy(a[0]); const rows=await db.query('select i.reference,i.title,i.narrative,r.facts,r.evidence_gaps,r.failed_tieouts,r.open_tasks,coalesce(r.is_signed,false) signed from items i join v_reporting r on r.id=i.id where i.cycle_id=$1 order by i.reference',[c.id]);
    const text=`# Internal draft: ${c.name}\n\nDraft for review. Not an issued financial statement.\n\n${display(rows)}\n`;
    result={file:writePrivate('drafts','md',text),disclosures:rows.length};break;
   }
   case 'weekly-review': {
    const resultSets={attention:await db.query('select * from v_attention order by due,reference'),reconciliations:await db.query('select name,cycle,difference,unit,passed from v_tieouts order by name'),signoffs:await db.query("select reference,owner,due from v_reporting where cycle_status='open' and not coalesce(is_signed,false) order by due")};
    result={file:writePrivate('drafts','md',`# Internal weekly review\n\n${display(resultSets)}\n`),...resultSets};break;
   }
   case 'close-cycle': {
    const c=await cy(a[0]),rows=await db.query('select * from v_reporting where cycle_id=$1',[c.id]);
    const retention=(await db.query("select retain_until >= (period_end+interval '7 years')::date ok from cycles where id=$1",[c.id]))[0].ok;
    if(!retention||!rows.length||rows.some(r=>!r.is_signed||!r.facts||r.evidence_gaps||r.failed_tieouts||r.open_tasks)) throw Error('Cycle needs disclosures, current approvals, clear checks and a reviewed retention date');
    result=await db.query("update cycles set status='closed' where id=$1 returning id,name,status",[c.id]);break;
   }
  }
  await db.exec(o['dry-run']&&cmd==='import'?'ROLLBACK':'COMMIT');
  return result;
 } catch(error) {await db.exec('ROLLBACK');throw error;}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href) {
 const argv=process.argv.slice(2),json=argv.includes('--json');let db;
 try {db=await getDb();const data=await run(db,argv);console.log(json?JSON.stringify(data,null,2):display(data));}
 catch(e){console.error(json?JSON.stringify({error:e.message}):`Error: ${e.message}`);process.exitCode=1;}
 finally{await db?.close();}
}
