
-- Tabla de suscripciones push
CREATE TABLE public.push_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  user_agent text,
  locale text,
  user_id uuid,
  event_id uuid,
  subscribed_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_subscriptions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_subscriptions TO authenticated;
GRANT ALL ON public.push_subscriptions TO service_role;

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede suscribirse (anónimo o autenticado)
CREATE POLICY "Anyone can subscribe to push"
ON public.push_subscriptions FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Cualquiera puede actualizar su propia suscripción por endpoint (necesario para upsert)
CREATE POLICY "Anyone can update push subscription by endpoint"
ON public.push_subscriptions FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Solo staff/admin pueden ver
CREATE POLICY "Staff view push subscriptions"
ON public.push_subscriptions FOR SELECT
TO authenticated
USING (public.is_staff_or_above(auth.uid()));

-- Solo admin puede eliminar
CREATE POLICY "Admins delete push subscriptions"
ON public.push_subscriptions FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE INDEX idx_push_subs_event ON public.push_subscriptions(event_id) WHERE revoked_at IS NULL;
CREATE INDEX idx_push_subs_active ON public.push_subscriptions(revoked_at) WHERE revoked_at IS NULL;

-- Tabla de campañas
CREATE TABLE public.push_campaigns (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  body text NOT NULL,
  url text,
  icon_url text,
  target text NOT NULL DEFAULT 'all',
  event_id uuid,
  created_by uuid,
  status text NOT NULL DEFAULT 'draft',
  sent_count integer NOT NULL DEFAULT 0,
  failed_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_campaigns TO authenticated;
GRANT ALL ON public.push_campaigns TO service_role;

ALTER TABLE public.push_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage push campaigns"
ON public.push_campaigns FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));
