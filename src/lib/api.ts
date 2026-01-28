const API_BASE = "/api";

export const endpoints = {
  sections: `${API_BASE}/sections`,
  submission: (sectionKey: string) =>
    `${API_BASE}/sections/${sectionKey}/submission`,
  owners: (sectionKey: string) => `${API_BASE}/sections/${sectionKey}/owners`,
  mockUser: `${API_BASE}/mock-user`,
};

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface RequestOptions<T = unknown> {
  method?: HttpMethod;
  body?: T;
}

export async function apiRequest<TBody = unknown>(
  url: string,
  options?: RequestOptions<TBody>
): Promise<Response> {
  const { method = "GET", body } = options ?? {};

  const config: RequestInit = {
    method,
    ...(body && {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  };

  return fetch(url, config);
}

export const api = {
  get: (url: string) => apiRequest(url),
  post: <TBody>(url: string, body: TBody) =>
    apiRequest<TBody>(url, { method: "POST", body }),
  put: <TBody>(url: string, body: TBody) =>
    apiRequest<TBody>(url, { method: "PUT", body }),
  delete: <TBody>(url: string, body: TBody) =>
    apiRequest<TBody>(url, { method: "DELETE", body }),
};
