
CREATE TABLE public.speaker_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NULL,
  nombre_completo text NOT NULL,
  email text NOT NULL,
  whatsapp text NOT NULL,
  cargo text NOT NULL,
  institucion_empresa text NOT NULL,
  pais text NOT NULL,
  titulo_ponencia text NOT NULL,
  resumen_abstract text NOT NULL,
  modalidad text NOT NULL,
  enlace_respaldo text NULL,
  estado text NOT NULL DEFAULT 'pendiente',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT speaker_proposals_modalidad_chk CHECK (modalidad IN ('presencial','virtual')),
  CONSTRAINT speaker_proposals_estado_chk CHECK (estado IN ('pendiente','revisado','aprobado','rechazado')),
  CONSTRAINT speaker_proposals_lengths_chk CHECK (
    char_length(nombre_completo) BETWEEN 2 AND 120 AND
    char_length(email) BETWEEN 5 AND 255 AND
    char_length(whatsapp) BETWEEN 5 AND 40 AND
    char_length(cargo) BETWEEN 2 AND 160 AND
    char_length(institucion_empresa) BETWEEN 2 AND 200 AND
    char_length(pais) BETWEEN 2 AND 80 AND
    char_length(titulo_ponencia) BETWEEN 4 AND 240 AND
    char_length(resumen_abstract) BETWEEN 20 AND 4000 AND
    (enlace_respaldo IS NULL OR char_length(enlace_respaldo) <= 500)
  )
);

CREATE INDEX idx_speaker_proposals_created_at ON public.speaker_proposals (created_at DESC);
CREATE INDEX idx_speaker_proposals_estado ON public.speaker_proposals (estado);

GRANT INSERT ON public.speaker_proposals TO anon, authenticated;
GRANT SELECT, UPDATE ON public.speaker_proposals TO authenticated;
GRANT ALL ON public.speaker_proposals TO service_role;

ALTER TABLE public.speaker_proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit speaker proposal"
  ON public.speaker_proposals
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins view speaker proposals"
  ON public.speaker_proposals
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins update speaker proposals"
  ON public.speaker_proposals
  FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
