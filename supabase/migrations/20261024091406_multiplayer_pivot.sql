begin;
create schema if not exists rihma_v2;
revoke all on schema rihma_v2 from public,anon,authenticated;
create table if not exists rihma_v2.rooms(
 id text primary key check(id ~ '^[A-Z2-9]{6}$'),
 revision bigint not null check(revision>0),
 state jsonb not null check(jsonb_typeof(state)='object'),
 updated_at timestamptz not null default now()
);
alter table rihma_v2.rooms enable row level security;
revoke all on rihma_v2.rooms from public,anon,authenticated;
create or replace function public.rihma_v2_read_room(room_key text)
returns jsonb language sql security definer set search_path='' as $$
 select coalesce((select jsonb_build_object('revision',revision,'state',state) from rihma_v2.rooms where id=room_key),jsonb_build_object('revision',0,'state',null));
$$;
create or replace function public.rihma_v2_save_room(room_key text,expected_revision bigint,next_state jsonb)
returns boolean language plpgsql security definer set search_path='' as $$
declare changed integer;
begin
 if expected_revision=0 then
  insert into rihma_v2.rooms(id,revision,state) values(room_key,1,next_state) on conflict(id) do nothing;
 else
  update rihma_v2.rooms set state=next_state,revision=revision+1,updated_at=now() where id=room_key and revision=expected_revision;
 end if;
 get diagnostics changed=row_count;
 return changed=1;
end;
$$;
revoke all on function public.rihma_v2_read_room(text) from public,anon,authenticated;
revoke all on function public.rihma_v2_save_room(text,bigint,jsonb) from public,anon,authenticated;
grant execute on function public.rihma_v2_read_room(text) to service_role;
grant execute on function public.rihma_v2_save_room(text,bigint,jsonb) to service_role;
commit;
