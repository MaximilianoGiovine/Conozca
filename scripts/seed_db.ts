import postgres from 'postgres';
import * as fs from 'fs';
import * as path from 'path';

const passwords = ['Supabase2026'];
const hosts = ['aws-0-sa-east-1.pooler.supabase.com'];
const ports = [6543, 5432];
const users = ['postgres.bnbsjuzglsnunttuexls', 'postgres'];

async function runMissingSchema() {
    const sqlContent = fs.readFileSync(path.join(process.cwd(), 'supabase', 'migrations', '20260304000000_cms_schema.sql'), 'utf-8');

    for (const port of ports) {
        for (const user of users) {
            const connStr = `postgresql://${user}:Supabase2026@${hosts[0]}:${port}/postgres`;
            console.log(`Trying: postgresql://${user}:***@${hosts[0]}:${port}/postgres`);
            try {
                const sql = postgres(connStr, { ssl: 'require', connect_timeout: 5 });
                // Just test the connection
                await sql`SELECT 1`;
                console.log(`✅ Success! Applying schema...`);
                await sql.unsafe(sqlContent);
                console.log('Schema pushed successfully!');
                process.exit(0);
            } catch (e: any) {
                console.log(`❌ Failed: ${e.message}`);
            }
        }
    }
    console.log('All connection attempts failed.');
    process.exit(1);
}

runMissingSchema();
