import { getAccessToken } from "./auth";

// Get API URL from environment
const API_URL = import.meta.env.VITE_API_URL;

// Main function to make HTTP requests
async function request(method, endpoint, data = null) {
  // Get JWT token for authentication
  const token = await getAccessToken();

  // Make request with token in header
  const response = await fetch(`${API_URL}/api/${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: data ? JSON.stringify(data) : null,
  });

  // Handle errors
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP ${response.status}`);
  }

  // DELETE returns no content (204)
  if (response.status === 204) {
    return { data: null };
  }

  // Parse and return JSON response
  const json = await response.json();
  return { data: json };
}

// API methods for CRUD operations
const api = {
  get: (endpoint) => request("GET", endpoint),
  post: (endpoint, data) => request("POST", endpoint, data),
  patch: (endpoint, data) => request("PATCH", endpoint, data),
  delete: (endpoint) => request("DELETE", endpoint),
};

export default api;
