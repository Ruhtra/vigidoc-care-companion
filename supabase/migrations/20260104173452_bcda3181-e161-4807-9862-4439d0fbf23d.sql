-- Create vital_records table for storing patient vital signs
CREATE TABLE public.vital_records (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    systolic INTEGER,
    diastolic INTEGER,
    heart_rate INTEGER,
    temperature NUMERIC(4,1),
    oxygen_saturation INTEGER,
    weight NUMERIC(5,2),
    pain_level INTEGER CHECK (pain_level >= 0 AND pain_level <= 10),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.vital_records ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own vital records" 
ON public.vital_records 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own vital records" 
ON public.vital_records 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vital records" 
ON public.vital_records 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vital records" 
ON public.vital_records 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_vital_records_updated_at
BEFORE UPDATE ON public.vital_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create profiles table for user information
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    full_name TEXT,
    birth_date DATE,
    phone TEXT,
    emergency_contact TEXT,
    medical_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Trigger for profiles timestamp
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name)
    VALUES (new.id, new.raw_user_meta_data ->> 'full_name');
    RETURN new;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create index for faster queries
CREATE INDEX idx_vital_records_user_id ON public.vital_records(user_id);
CREATE INDEX idx_vital_records_recorded_at ON public.vital_records(recorded_at DESC);