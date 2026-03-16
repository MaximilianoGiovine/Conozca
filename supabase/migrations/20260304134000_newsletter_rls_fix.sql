-- Rename the policy to be more specific
ALTER POLICY "Anyone can subscribe to newsletter" ON newsletter_subscriptions RENAME TO "Anyone can insert subscriptions";

-- Add update policy for upsert to work
CREATE POLICY "Anyone can update their own subscription" 
ON newsletter_subscriptions FOR UPDATE 
USING (true)
WITH CHECK (true);

