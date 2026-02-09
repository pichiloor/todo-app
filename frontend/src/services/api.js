import { getAccessToken } from "./auth";

const API_URL = import.meta.env.VITE_API_URL;

async function request(method, endpoint, data = null) {
  const token = await getAccessToken();

  const response = await fetch(`${API_URL}/api/${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: data ? JSON.stringify(data) : null,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP ${response.status}`);
  }

  // DELETE no siempre devuelve JSON
  if (response.status === 204) {
    return { data: null };
  }

  const json = await response.json();
  return { data: json };
}

const api = {
  get: (endpoint) => request("GET", endpoint),
  post: (endpoint, data) => request("POST", endpoint, data),
  patch: (endpoint, data) => request("PATCH", endpoint, data),
  delete: (endpoint) => request("DELETE", endpoint),
};

export default api;
