// import NextAuth, { NextAuthOptions } from "next-auth";
// import GoogleProvider from "next-auth/providers/google";
// import CredentialsProvider from "next-auth/providers/credentials";
// import { PrismaAdapter } from "@next-auth/prisma-adapter";
// import { prisma } from "@/lib/prisma";
// import { compare } from "bcryptjs";

// export const authOptions: NextAuthOptions = {
//   adapter: PrismaAdapter(prisma),
//   providers: [
//     // 🔐 Google OAuth
//     GoogleProvider({
//       clientId: process.env.GOOGLE_ID!,
//       clientSecret: process.env.GOOGLE_SECRET!,
      
//     }),

//     // ✉️ Email + Password Login
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "text" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         const user = await prisma.user.findUnique({
//           where: { email: credentials?.email },
//         });

//         if (!user || !user.hashedPassword) {
//           throw new Error("Invalid credentials");
//         }

//         const isValid = await compare(credentials.password, user.hashedPassword);

//         if (!isValid) {
//           throw new Error("Invalid credentials");
//         }

//         return user;
//       },
//     }),
//   ],
//   session: {
//     strategy: "jwt",
//   },
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       if (token && session.user) {
//         session.user.id = token.id as string;
//       }
//       return session;
//     },
//   },

//   secret: process.env.NEXTAUTH_SECRET,
// };

// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };


import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { compare, hash } from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [

    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" }, 
        isSignUp: { label: "SignUp?", type: "text" },
      },
      async authorize(credentials) {
        const { email, password, name, isSignUp } = credentials;

        if (!email || !password) {
          throw new Error("Email and password are required");
        }

        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (isSignUp === "true") {
          // SIGN UP FLOW
          if (existingUser) {
            throw new Error("User already exists");
          }

          const hashedPassword = await hash(password, 10);

          const newUser = await prisma.user.create({
            data: {
              email,
              name,
              hashedPassword,
            },
          });

          return newUser;
        } else {
          // LOGIN FLOW
          if (!existingUser || !existingUser.hashedPassword) {
            throw new Error("Invalid credentials");
          }

          const isValid = await compare(password, existingUser.hashedPassword);
          if (!isValid) {
            throw new Error("Invalid credentials");
          }

          return existingUser;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
