import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { getDb,REPO_ROOT } from './lib/db.mjs';
import { migrate } from './migrate.mjs';
import { seed } from './seed.mjs';
import { run,display } from './disclosures.mjs';
const root=fs.mkdtempSync(path.join(os.tmpdir(),'disclosure-demo-'));
process.env.DATABASE_URL='';process.env.DATA_DIR=path.join(root,'db');process.env.OUTPUT_DIR=root;
let db=await getDb();
try {
 await migrate(db);await seed(db);
 for(const cmd of ['reporting-cycle','evidence-gaps','tie-outs']) console.log(`\n${cmd}\n${display(await run(db,[cmd]))}`);
 await db.close();db=null;
 for(const script of ['docs.mjs','view.mjs']) {const p=spawnSync(process.execPath,[path.join(REPO_ROOT,'scripts',script)],{cwd:REPO_ROOT,env:process.env,encoding:'utf8',windowsHide:true});if(p.status!==0) throw Error(p.stderr);console.log(p.stdout);}
 if(process.argv.includes('--keep'))console.log(`Demo files: ${root}`);
} finally {await db?.close();if(!process.argv.includes('--keep'))fs.rmSync(root,{recursive:true,force:true});}
