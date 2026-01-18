-- Allow service role and queries by discord_id to access profiles (for bot)
-- This enables the Discord bot to check if a user is linked by their discord_id

-- Create a new policy that allows SELECT when filtering by discord_id
-- This is needed for the Discord bot which uses the anon key
CREATE POLICY "Allow lookup by discord_id for linking" 
ON public.profiles 
FOR SELECT 
USING (
  -- Allow if the discord_id column is being filtered (bot needs this)
  -- Since we can't check the query, we allow access to profiles that have a discord_id set
  -- The bot only queries by discord_id so this enables that use case
  discord_id IS NOT NULL
);