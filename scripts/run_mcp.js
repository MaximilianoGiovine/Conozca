// Script to update the superadmin password using Supabase Admin API
const { spawn } = require('child_process');

const mcpToken = 'sbp_6fd5d6ae16f1a2ea0115d488b1b931ed3c4acd24';

const child = spawn('npx', ['-y', '@supabase/mcp-server-supabase@latest', '--project-ref=bnbsjuzglsnunttuexls'], {
    env: { ...process.env, SUPABASE_ACCESS_TOKEN: mcpToken }
});

let output = '';
child.stdout.on('data', (data) => {
    output += data.toString();
    console.log('OUT:', data.toString());
});
child.stderr.on('data', (data) => console.error('ERR:', data.toString()));

// Update user auth details: confirm email and set password
const sql = `
UPDATE auth.users 
SET 
  email_confirmed_at = now(),
  encrypted_password = crypt('Conozca2026!', gen_salt('bf')),
  updated_at = now()
WHERE email = 'admin@conozca.com';

SELECT email, email_confirmed_at IS NOT NULL as confirmed FROM auth.users WHERE email = 'admin@conozca.com';
`;

const request = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: {
        name: "execute_sql",
        arguments: { query: sql }
    }
};

console.log('Setting superadmin password...');
child.stdin.write(JSON.stringify(request) + '\n');

setTimeout(() => { child.kill(); }, 10000);
