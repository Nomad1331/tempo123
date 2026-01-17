-- Create a table for pending app-based level-up notifications
-- The bot will poll this table and process level-ups with custom images

CREATE TABLE public.pending_level_ups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  discord_id TEXT NOT NULL,
  hunter_name TEXT NOT NULL,
  old_level INTEGER NOT NULL,
  new_level INTEGER NOT NULL,
  old_rank TEXT NOT NULL,
  new_rank TEXT NOT NULL,
  is_rank_up BOOLEAN NOT NULL DEFAULT false,
  processed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.pending_level_ups ENABLE ROW LEVEL SECURITY;

-- Only service role can access this table (bot uses service role key)
-- No user-facing policies needed

-- Create index for efficient polling
CREATE INDEX idx_pending_level_ups_unprocessed ON public.pending_level_ups (processed, created_at) WHERE processed = false;

-- Auto-cleanup old processed entries after 24 hours
CREATE OR REPLACE FUNCTION public.cleanup_old_level_ups()
RETURNS trigger AS $$
BEGIN
  DELETE FROM public.pending_level_ups 
  WHERE processed = true AND processed_at < NOW() - INTERVAL '24 hours';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER cleanup_level_ups_trigger
AFTER INSERT ON public.pending_level_ups
FOR EACH STATEMENT
EXECUTE FUNCTION public.cleanup_old_level_ups();