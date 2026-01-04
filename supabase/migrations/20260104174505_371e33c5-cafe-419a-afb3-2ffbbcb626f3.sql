-- Add phone column to profiles table if not exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;