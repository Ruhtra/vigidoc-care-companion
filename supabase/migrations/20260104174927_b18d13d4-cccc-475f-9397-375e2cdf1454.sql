-- Create shared_reports table for storing shareable data links
CREATE TABLE public.shared_reports (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    share_code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL DEFAULT 'Relatório de Sinais Vitais',
    include_blood_pressure BOOLEAN NOT NULL DEFAULT true,
    include_heart_rate BOOLEAN NOT NULL DEFAULT true,
    include_temperature BOOLEAN NOT NULL DEFAULT true,
    include_oxygen BOOLEAN NOT NULL DEFAULT true,
    include_weight BOOLEAN NOT NULL DEFAULT true,
    include_pain BOOLEAN NOT NULL DEFAULT true,
    include_profile BOOLEAN NOT NULL DEFAULT false,
    date_from DATE,
    date_to DATE,
    expires_at TIMESTAMP WITH TIME ZONE,
    views_count INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.shared_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own shared reports" 
ON public.shared_reports 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own shared reports" 
ON public.shared_reports 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shared reports" 
ON public.shared_reports 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shared reports" 
ON public.shared_reports 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policy for public access to active reports via share_code
CREATE POLICY "Anyone can view active shared reports by code"
ON public.shared_reports
FOR SELECT
USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Create indexes
CREATE INDEX idx_shared_reports_user_id ON public.shared_reports(user_id);
CREATE INDEX idx_shared_reports_share_code ON public.shared_reports(share_code);