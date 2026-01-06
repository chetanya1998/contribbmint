'use client';

import { signIn } from 'next-auth/react';

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto card p-6 flex flex-col gap-4 text-center">
      <h1 className="text-2xl font-semibold">Sign in with GitHub</h1>
      <p className="text-sm text-slate-600">Authenticate to unlock role-based insights and dashboards.</p>
      <button
        className="px-4 py-2 rounded-full bg-accent text-white text-sm font-medium"
        onClick={() => signIn('github', { callbackUrl: '/onboarding' })}
      >
        Continue with GitHub
      </button>
    </div>
  );
}
