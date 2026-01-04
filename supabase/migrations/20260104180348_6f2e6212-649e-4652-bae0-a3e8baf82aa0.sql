-- Create a secure function to get shared report data without exposing user_id
CREATE OR REPLACE FUNCTION public.get_shared_report_data(share_code_param TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  report_record RECORD;
  vitals_data JSON;
  profile_data JSON;
  result JSON;
BEGIN
  -- Validate share code and check expiration
  SELECT id, title, include_blood_pressure, include_heart_rate, 
         include_temperature, include_oxygen, include_weight, 
         include_pain, include_profile, date_from, date_to, 
         created_at, user_id, is_active, expires_at
  INTO report_record 
  FROM shared_reports 
  WHERE share_code = share_code_param 
    AND is_active = true 
    AND (expires_at IS NULL OR expires_at > now());
  
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Report not found or expired');
  END IF;
  
  -- Get vitals data
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
    ) ORDER BY v.recorded_at ASC
  )
  INTO vitals_data
  FROM vital_records v
  WHERE v.user_id = report_record.user_id 
    AND (report_record.date_from IS NULL OR v.recorded_at >= report_record.date_from::timestamp with time zone)
    AND (report_record.date_to IS NULL OR v.recorded_at <= (report_record.date_to::text || 'T23:59:59')::timestamp with time zone);
  
  -- Get profile data if included
  IF report_record.include_profile THEN
    SELECT json_build_object(
      'full_name', p.full_name,
      'birth_date', p.birth_date,
      'phone', p.phone,
      'emergency_contact', p.emergency_contact,
      'medical_notes', p.medical_notes
    )
    INTO profile_data
    FROM profiles p
    WHERE p.user_id = report_record.user_id;
  ELSE
    profile_data := NULL;
  END IF;
  
  -- Update view count
  UPDATE shared_reports SET views_count = views_count + 1 
  WHERE id = report_record.id;
  
  -- Build result without user_id
  result := json_build_object(
    'report', json_build_object(
      'id', report_record.id,
      'title', report_record.title,
      'include_blood_pressure', report_record.include_blood_pressure,
      'include_heart_rate', report_record.include_heart_rate,
      'include_temperature', report_record.include_temperature,
      'include_oxygen', report_record.include_oxygen,
      'include_weight', report_record.include_weight,
      'include_pain', report_record.include_pain,
      'include_profile', report_record.include_profile,
      'date_from', report_record.date_from,
      'date_to', report_record.date_to,
      'created_at', report_record.created_at
    ),
    'vitals', COALESCE(vitals_data, '[]'::json),
    'profile', profile_data
  );
  
  RETURN result;
END;
$$;

-- Grant execute to anonymous users so unauthenticated viewers can access shared reports
GRANT EXECUTE ON FUNCTION public.get_shared_report_data(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.get_shared_report_data(TEXT) TO authenticated;