// Get credentials from environment variables
const API_URL = import.meta.env.VITE_API_URL;
const USER = import.meta.env.VITE_API_USER;
const PASSWORD = import.meta.env.VITE_API_PASSWORD;

// Store token in memory
let accessToken = null;

// Get JWT access token (cached or new)
export async function getAccessToken() {
  // If token exists, reuse it
  if (accessToken) {
    return accessToken;
  }

  // Request new token from backend
  const response = await fetch(`${API_URL}/api/auth/token/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: USER,
      password: PASSWORD,
    }),
  });

  // Handle authentication errors
  if (!response.ok) {
    throw new Error("Failed to get JWT token");
  }

  // Save and return token
  const data = await response.json();
  accessToken = data.access;

  return accessToken;
}
