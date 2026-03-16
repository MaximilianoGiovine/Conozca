import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function setupSuperadmin() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    console.log("Creando usuario superadmin...");
    const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: 'superadmin@conozcacms.com',
        password: 'SuperPassword123!',
    });

    if (authErr) {
        if (authErr.message.includes("User already registered")) {
            console.log("User already exists. Skipping auth creation.");
        } else {
            console.error("Error creating auth user:", authErr);
            return;
        }
    }

    // Since we created the user, we need to assign the role.
    // Because of RLS, the anon key won't let us insert into user_roles easily.
    // I will output the User ID so the MCP SQL tool can be used to insert the role!

    // Attempting to login to get the ID if already registered
    const { data: loginData } = await supabase.auth.signInWithPassword({
        email: 'superadmin@conozcacms.com',
        password: 'SuperPassword123!'
    });

    const user = authData?.user || loginData?.user;

    if (user) {
        console.log("USER_ID_CREATED:", user.id);
    } else {
        console.log("Could not obtain user ID.");
    }
}

setupSuperadmin();
