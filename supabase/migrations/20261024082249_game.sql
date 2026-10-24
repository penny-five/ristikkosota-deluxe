begin;
create schema if not exists rihma_private;
revoke all on schema rihma_private from public, anon, authenticated;
create table if not exists rihma_private.room (
 id text primary key check (id = 'eduskunta'),
 revision bigint not null check (revision > 0),
 state jsonb not null check (jsonb_typeof(state) = 'object'),
 updated_at timestamptz not null default now()
);
alter table rihma_private.room enable row level security;
revoke all on rihma_private.room from public, anon, authenticated;

create or replace function public.rihma_read_room()
returns jsonb language sql security definer set search_path = '' as $$
 select coalesce(
  (select jsonb_build_object('revision', revision, 'state', state)
   from rihma_private.room where id = 'eduskunta'),
  jsonb_build_object('revision', 0, 'state', null)
 );
$$;
create or replace function public.rihma_save_room(expected_revision bigint, next_state jsonb)
returns boolean language plpgsql security definer set search_path = '' as $$
declare changed integer;
begin
 if expected_revision = 0 then
  insert into rihma_private.room(id, revision, state)
  values ('eduskunta', 1, next_state) on conflict (id) do nothing;
 else
  update rihma_private.room set state = next_state,
    revision = revision + 1, updated_at = now()
  where id = 'eduskunta' and revision = expected_revision;
 end if;
 get diagnostics changed = row_count;
 return changed = 1;
end;
$$;
revoke all on function public.rihma_read_room() from public, anon, authenticated;
revoke all on function public.rihma_save_room(bigint, jsonb) from public, anon, authenticated;
grant execute on function public.rihma_read_room() to service_role;
grant execute on function public.rihma_save_room(bigint, jsonb) to service_role;
commit;
