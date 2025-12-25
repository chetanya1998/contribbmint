import NextAuth from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from './prisma';

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || 'github-client-id',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || 'github-client-secret',
    }),
  ],
  callbacks: {
    async session({ session, user }: any) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role;
        session.user.githubUsername = user.githubUsername;
      }
      return session;
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
  },
  pages: {
    signIn: '/login',
  },
};

export const { handlers: authHandlers, auth, signIn, signOut } = NextAuth(authOptions as any);
