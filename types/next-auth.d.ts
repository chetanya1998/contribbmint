import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    role?: string;
    githubUsername?: string | null;
  }
  interface Session {
    user?: User;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string;
  }
}
