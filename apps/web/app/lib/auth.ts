import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import EmailProvider from 'next-auth/providers/email';
import { PrismaClient } from '@prisma/client';
import type { DefaultSession } from 'next-auth';

const prisma = new PrismaClient();

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role?: string;
      familyId?: string;
    } & DefaultSession['user'];
  }

  interface User {
    role?: string;
    familyId?: string;
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id: string;
    role?: string;
    familyId?: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.familyId = user.familyId;
      } else if (token.email) {
        // Refresh user data from DB
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { id: true, role: true, familyId: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role ?? undefined;
          token.familyId = dbUser.familyId ?? undefined;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role;
        session.user.familyId = token.familyId;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify-request',
  },
});
