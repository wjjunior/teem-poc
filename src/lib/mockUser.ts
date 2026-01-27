export interface MockUser {
  id: string;
  name: string;
  email: string;
}

export function getMockUser(): MockUser | null {
  return null;
}

export function setMockUser(user: MockUser | null): void {
  // Implementation placeholder
}
