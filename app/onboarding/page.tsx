import { redirect } from "next/navigation";
import { getMockUserEmail } from "@/lib/mockUser";

export default async function OnboardingPage() {
  const email = await getMockUserEmail();

  if (!email) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-4xl space-y-8 rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Onboarding</h1>
        <p className="text-gray-600">Welcome, {email}</p>
      </div>
    </div>
  );
}
