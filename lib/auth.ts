import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyUserCredentials } from "./users";

export const FALLBACK_SECRET = "portal-de-obras-super-secret-production-key-2024-32chars";

// Asegurar que process.env.NEXTAUTH_SECRET siempre exista en runtime para evitar el error NO_SECRET en Vercel
if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = process.env.AUTH_SECRET || FALLBACK_SECRET;
}

// En Vercel, si NEXTAUTH_URL no fue seteada manualmente, autodetectar a partir de VERCEL_URL
if (!process.env.NEXTAUTH_URL && process.env.VERCEL_URL) {
  process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 horas de sesión
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credenciales Corporativas",
      credentials: {
        email: { label: "Correo Electrónico", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await verifyUserCredentials(credentials.email, credentials.password);

        if (!user) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.status = (user as any).status;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as any;
        session.user.status = token.status as any;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || FALLBACK_SECRET,
};
