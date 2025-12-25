import { signIn } from '@/lib/auth';

export default function LoginPage() {
  async function handleLogin() {
    'use server';
    await signIn('github');
  }
  return (
    <div className="max-w-md mx-auto card p-6 flex flex-col gap-4 text-center">
      <h1 className="text-2xl font-semibold">Sign in with GitHub</h1>
      <p className="text-sm text-slate-600">Authenticate to unlock role-based insights and dashboards.</p>
      <form action={handleLogin}>
        <button className="px-4 py-2 rounded-full bg-accent text-white text-sm font-medium" type="submit">
          Continue with GitHub
        </button>
      </form>
    </div>
  );
}
