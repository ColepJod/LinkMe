-- Add support QR code URL column to profiles
alter table public.profiles add column support_qr_url text;
