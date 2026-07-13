ALTER TABLE public.speaker_proposals
  ADD COLUMN IF NOT EXISTS eje_tematico text NOT NULL DEFAULT 'tecnologias_emergentes';

ALTER TABLE public.speaker_proposals
  ADD CONSTRAINT speaker_proposals_eje_tematico_check
  CHECK (eje_tematico IN ('tecnologias_emergentes','experiencias_aprendizaje','nuevos_modelos_gestion'));

ALTER TABLE public.speaker_proposals ALTER COLUMN eje_tematico DROP DEFAULT;