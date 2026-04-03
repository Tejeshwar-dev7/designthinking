# Supabase Setup

## 1. Create `.env.local`

Copy [`.env.local.example`](../.env.local.example) to `.env.local` and paste your real keys:

```env
NEXT_PUBLIC_SUPABASE_URL=https://jhzcidjhnxbouxzbjdad.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 2. Run the schema

In Supabase:

1. Open **SQL Editor**
2. Paste the contents of [`supabase/schema.sql`](../supabase/schema.sql)
3. Run it once

## 3. Get the two missing keys

From **Project Settings -> API**:

- `anon public key`
- `service_role key`

## 4. Why both keys are needed

- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: browser login and client reads
- `SUPABASE_SERVICE_ROLE_KEY`: server actions for enrollment, embeddings, and attendance writes

## 5. After setup

Run the app again and the repo will use your own Supabase project instead of the original one.
