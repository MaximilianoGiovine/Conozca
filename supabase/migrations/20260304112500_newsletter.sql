-- Create Newsletter Subscriptions Table
CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can subscribe to newsletter" ON public.newsletter_subscriptions 
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Only admins can view newsletter subscriptions" ON public.newsletter_subscriptions 
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Only admins can manage newsletter subscriptions" ON public.newsletter_subscriptions 
    FOR ALL USING (public.is_admin());
