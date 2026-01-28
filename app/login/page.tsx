"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { endpoints, api } from "@/lib/api";

function TeemLogo() {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-sm">
      TEEM
    </div>
  );
}

function HeroSection() {
  return (
    <div className="hidden lg:flex lg:flex-1 bg-linear-to-br from-blue-100 via-blue-200 to-blue-300 items-center justify-center relative overflow-hidden">
      <div className="relative z-10 flex w-full justify-center px-8">
        <div className="relative h-[70vh] w-full max-w-xl">
          <Image
            src="https://portal.hireteem.com/Woman.webp"
            alt="Woman"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await api.post(endpoints.mockUser, { email });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      router.push("/onboarding");
    } catch {
      setError("Failed to connect to server");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left side - Form */}
      <div className="flex flex-1 flex-col justify-center px-8 py-12 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <TeemLogo />

          <h1 className="mt-8 text-2xl font-semibold text-gray-900">
            Log in to your Portal
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Enter any email to simulate login (mock authentication)
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? "Loading..." : "Log In"}
            </button>
          </form>
        </div>
      </div>
      <HeroSection />
    </div>
  );
}
