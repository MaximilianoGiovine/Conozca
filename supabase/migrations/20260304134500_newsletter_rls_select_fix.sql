-- Add SELECT policy for everyone to allow upsert and returning data
CREATE POLICY "Anyone can view their own subscription status" 
ON newsletter_subscriptions FOR SELECT 
USING (true);
