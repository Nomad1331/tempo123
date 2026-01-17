-- Fix: Restrict profiles reading to authenticated users only
-- This prevents Discord IDs from being exposed to unauthenticated users

-- First, drop the existing public profiles policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view public profiles" ON public.profiles;

-- Create new policy: Only authenticated users can view public profiles
CREATE POLICY "Authenticated users can view public profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (is_public = true OR user_id = auth.uid());