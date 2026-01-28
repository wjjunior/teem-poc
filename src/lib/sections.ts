import { prisma } from "./prisma";

export async function getSectionByKey(sectionKey: string) {
  return prisma.onboardingSection.findUnique({
    where: { key: sectionKey },
  });
}
