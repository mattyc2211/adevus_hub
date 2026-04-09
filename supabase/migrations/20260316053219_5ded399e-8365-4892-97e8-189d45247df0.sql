ALTER TABLE public.apps ADD COLUMN prompts text NOT NULL DEFAULT '';
ALTER TABLE public.apps ADD COLUMN documentation text NOT NULL DEFAULT '';