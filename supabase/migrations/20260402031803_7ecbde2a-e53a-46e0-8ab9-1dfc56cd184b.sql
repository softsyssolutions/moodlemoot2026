
-- Create stand_staff table
CREATE TABLE public.stand_staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_slug text NOT NULL,
  user_id uuid NOT NULL,
  display_name text NOT NULL,
  status text NOT NULL DEFAULT 'offline',
  current_chat_id uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.stand_staff ENABLE ROW LEVEL SECURITY;

-- Everyone can view staff
CREATE POLICY "Anyone can view stand staff"
  ON public.stand_staff FOR SELECT
  TO public
  USING (true);

-- Staff can update their own record
CREATE POLICY "Staff update own record"
  ON public.stand_staff FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can manage all staff
CREATE POLICY "Admins manage stand staff"
  ON public.stand_staff FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create stand_chat_sessions table
CREATE TABLE public.stand_chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_slug text NOT NULL,
  visitor_id uuid NOT NULL,
  staff_id uuid,
  status text NOT NULL DEFAULT 'waiting',
  created_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz
);

ALTER TABLE public.stand_chat_sessions ENABLE ROW LEVEL SECURITY;

-- Participants can view their sessions
CREATE POLICY "Users view own sessions"
  ON public.stand_chat_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = visitor_id OR auth.uid() = staff_id);

-- Staff can view waiting sessions for their stand
CREATE POLICY "Staff view waiting sessions"
  ON public.stand_chat_sessions FOR SELECT
  TO authenticated
  USING (
    status = 'waiting' AND
    EXISTS (
      SELECT 1 FROM public.stand_staff ss
      WHERE ss.user_id = auth.uid() AND ss.sponsor_slug = stand_chat_sessions.sponsor_slug
    )
  );

-- Authenticated users can create sessions
CREATE POLICY "Users create sessions"
  ON public.stand_chat_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = visitor_id);

-- Staff can update sessions they're assigned to or waiting sessions
CREATE POLICY "Staff update sessions"
  ON public.stand_chat_sessions FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = staff_id OR
    auth.uid() = visitor_id OR
    (status = 'waiting' AND EXISTS (
      SELECT 1 FROM public.stand_staff ss
      WHERE ss.user_id = auth.uid() AND ss.sponsor_slug = stand_chat_sessions.sponsor_slug
    ))
  );

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.stand_staff;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stand_chat_sessions;
