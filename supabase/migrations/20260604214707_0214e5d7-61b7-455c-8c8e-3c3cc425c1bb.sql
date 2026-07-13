ALTER TABLE public.coupons DROP CONSTRAINT IF EXISTS coupons_category_check;
ALTER TABLE public.coupons ADD CONSTRAINT coupons_category_check
  CHECK (category = ANY (ARRAY['full'::text, 'edu100'::text, 'edu50'::text, 'staff50'::text, 'vip'::text, 'speaker'::text, 'sponsor'::text, 'partner'::text, 'custom'::text]));