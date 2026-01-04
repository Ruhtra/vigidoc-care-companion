-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Function to get all patients data for admins
CREATE OR REPLACE FUNCTION public.get_admin_patients_data(
  date_from_param date DEFAULT NULL,
  date_to_param date DEFAULT NULL,
  user_id_param uuid DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  -- Check if user is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN json_build_object('error', 'Unauthorized');
  END IF;
  
  -- Get patients with their vitals
  SELECT json_agg(patient_data)
  INTO result
  FROM (
    SELECT 
      p.id,
      p.user_id,
      p.full_name,
      p.phone,
      p.birth_date,
      p.emergency_contact,
      p.medical_notes,
      (
        SELECT json_agg(
          json_build_object(
            'id', v.id,
            'recorded_at', v.recorded_at,
            'systolic', v.systolic,
            'diastolic', v.diastolic,
            'heart_rate', v.heart_rate,
            'temperature', v.temperature,
            'oxygen_saturation', v.oxygen_saturation,
            'weight', v.weight,
            'pain_level', v.pain_level
          ) ORDER BY v.recorded_at DESC
        )
        FROM vital_records v
        WHERE v.user_id = p.user_id
          AND (date_from_param IS NULL OR v.recorded_at >= date_from_param::timestamp with time zone)
          AND (date_to_param IS NULL OR v.recorded_at <= (date_to_param::text || 'T23:59:59')::timestamp with time zone)
      ) AS vitals
    FROM profiles p
    WHERE (user_id_param IS NULL OR p.user_id = user_id_param)
  ) AS patient_data;
  
  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.has_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_patients_data TO authenticated;