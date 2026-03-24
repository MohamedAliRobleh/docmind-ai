# DocuMind AI

AI-powered document analysis SaaS platform.

## Setup

### Prerequisites
- Node.js 18+
- Supabase account
- Stripe account
- Anthropic API key

### Web App (Next.js)
1. cd apps/web
2. npm install
3. cp .env.example .env.local
4. Fill in environment variables
5. npm run dev

### Mobile App (Expo)
1. cd apps/mobile
2. npm install
3. expo start

### Database Schema
Run the following SQL in Supabase:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name TEXT,
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_id UUID REFERENCES documents(id),
  messages JSONB
);

CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_id UUID REFERENCES documents(id),
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  stripe_id TEXT,
  plan TEXT,
  status TEXT
);
```

### Deployment
- Web: Vercel
- Mobile: Expo EAS

## Features
- PDF upload and text extraction
- AI summary generation
- Chat with documents
- Professional report generation
- Key data extraction
- Subscription management