import { redirect } from "next/navigation";
import { getMockUserEmail } from "@/lib/mockUser";
import OnboardingContent from "@/components/OnboardingContent";

export default async function OnboardingPage() {
  const email = await getMockUserEmail();

  if (!email) {
    redirect("/login");
  }

  return <OnboardingContent userEmail={email} />;
}
