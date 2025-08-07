
"use client";
import React from "react";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {

  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');


  const [loading, setLoading] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError(res.error);
    } else {
      router.push('/');
    }
  };


  return (
    <div className="min-h-screen px-4 py-6 text-white">
      <button
        onClick={() => window.history.back()}
        className="flex items-center text-sm text-white bg-neutral-800 hover:bg-neutral-700 px-3 py-2 rounded-lg transition-colors"
      >
        <ChevronLeft className="mr-1 w-4 h-4" />
        Back
      </button>
      <div className="flex flex-col items-center justify-center mt-20">
        <div className="w-full max-w-sm  p-8">
          <h1 className="text-3xl font-bold text-center">Yoo, welcome back!</h1>
          <p className="text-center text-sm text-stone-400 mt-2">
            First time here?{" "}
            <Link href='/Register' className="cursor-pointer hover:underline text-white">
              Sign up for free
            </Link>
          </p>
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Your email"
              className="w-full px-4 py-2 rounded-md bg-neutral-900 border border-neutral-700 text-white placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-600"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Password"
              className="w-full px-4 py-2 rounded-md bg-neutral-900 border border-neutral-700 text-white placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-600"
            />
            <button
              type="submit"
              className="w-full bg-gray-200 hover:bg-gray-300 text-black font-semibold py-2 px-4 rounded-md transition-colors "
            >
              Sign In
            </button>
            <div className="flex items-center justify-center gap-4 my-6">
              <hr className="flex-grow border-t border-neutral-700" />
              <span className="text-sm text-stone-400">OR</span>
              <hr className="flex-grow border-t border-neutral-700" />
            </div>
          </form>
          <button
              className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-semibold py-2 px-4 rounded-md transition-colors border border-neutral-700 flex items-center justify-center"
              onClick={() => signIn("google",{ callbackUrl: "/" })}
            >
              <Image src="/assets/googlelogo.webp" alt="orb" height={28} width={28} />
              <p className="ml-[8px]">Sign In with Google</p>
          </button>
          <p className="text-center text-sm text-stone-400 mt-4">
            By signing in, you agree to our{" "}
            <span className="cursor-pointer hover:underline text-white">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="cursor-pointer hover:underline text-white">
              Privacy Policy
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}