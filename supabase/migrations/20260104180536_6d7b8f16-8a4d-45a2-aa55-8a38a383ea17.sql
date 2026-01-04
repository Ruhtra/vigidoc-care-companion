-- Remove the public RLS policy since we now use the secure function
DROP POLICY IF EXISTS "Anyone can view active shared reports by code" ON public.shared_reports;