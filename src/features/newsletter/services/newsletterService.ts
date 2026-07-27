import { createClient } from '@/lib/supabase/client';

export const newsletterService = {
    async subscribe(email: string) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('newsletter_subscriptions')
            .upsert({ email, is_active: true }, { onConflict: 'email' })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
