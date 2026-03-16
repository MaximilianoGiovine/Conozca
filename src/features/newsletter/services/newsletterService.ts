import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export const newsletterService = {
    async subscribe(email: string) {
        const { data, error } = await supabase
            .from('newsletter_subscriptions')
            .upsert({ email, is_active: true }, { onConflict: 'email' })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
