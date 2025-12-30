# Next.js 14 Development Skill

## Quick Commands
```bash
# Create new project
npx create-next-app@latest project --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"

# Install shadcn/ui
npx shadcn@latest init

# Add component
npx shadcn@latest add button card table

# Development
npm run dev

# Build
npm run build
```

## App Router Structure
```
app/
├── layout.tsx          # Root layout
├── page.tsx            # Home page (/)
├── loading.tsx         # Loading UI
├── error.tsx           # Error UI
├── [slug]/page.tsx     # Dynamic route
└── api/route.ts        # API route
```

## Common Patterns

### Server Component (Default)
```tsx
// app/referees/page.tsx
import { getReferees } from '@/lib/data';

export default async function RefereesPage() {
  const referees = await getReferees();
  return <RefereeList referees={referees} />;
}
```

### Client Component
```tsx
'use client';
import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### API Route
```tsx
// app/api/referees/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const data = await fetch('...');
  return NextResponse.json(data);
}
```
