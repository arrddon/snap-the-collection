-- Apply once in Supabase SQL Editor before enabling the v04 Lens.
-- Existing fragments keep NULL and remain visible in the full collection.
alter table public.collection_items
  add column if not exists mission_text text
  check (char_length(mission_text) <= 500);

comment on column public.collection_items.mission_text is
  'Original mission card text read at the start of this capture; independent of AI fragment keywords.';
