// src/app/api/auth/[...nextauth]/route.js

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";

export const authOptions = {
  // Подключаем адаптер Prisma для хранения пользователей, аккаунтов, сессий
  adapter: PrismaAdapter(prisma),

  // Провайдеры аутентификации
  providers: [
    // 1) Email + пароль (прототип — без проверки пароля, просто upsert по email)
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Пароль", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        // Ищем пользователя по email
        let user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        // Если нет — создаём
        if (!user) {
          user = await prisma.user.create({
            data: { email: credentials.email },
          });
        }
        // Возвращаем объект, из которого NextAuth создаст JWT
        return { id: user.id, email: user.email, name: user.name ?? null };
      },
    }),

    // 2) Google OAuth 2.0
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  // Используем JWT для сессий
  session: { strategy: "jwt" },
  // Секрет для подписи JWT и шифрования
  secret: process.env.NEXTAUTH_SECRET,

  // Указываем собственную страницу входа
  pages: {
    signIn: "/login",
  },

  callbacks: {
    // При создании JWT передадим в token поле id пользователя
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },
    // Когда клиент запрашивает сессию, кладём в session.user.id значение из token.id
    async session({ session, token }) {
      session.user.id = token.id;
      return session;
    },
  },

  // Включаем подробные логи в development
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
