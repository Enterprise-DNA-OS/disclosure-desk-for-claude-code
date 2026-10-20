import fs from 'node:fs';
import path from 'node:path';
import { getDb,REPO_ROOT } from './lib/db.mjs';
export async function seed(db) {
 const existing=await db.query('select name from workspace');
 if(existing.length&&existing[0].name!=='Harbour Reporting Demo') throw Error('Demo seed refuses a business workspace');
 await db.exec('BEGIN');
 try {await db.exec(fs.readFileSync(path.join(REPO_ROOT,'supabase/seed.sql'),'utf8'));await db.exec('COMMIT');}
 catch(e){await db.exec('ROLLBACK');throw e;}
}
if(process.argv[1]?.endsWith('seed.mjs')) {const db=await getDb();try{await seed(db);console.log('Fictional reporting demo seeded');}finally{await db.close();}}
