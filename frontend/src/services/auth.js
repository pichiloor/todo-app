const API_URL = import.meta.env.VITE_API_URL;
const USER = import.meta.env.VITE_API_USER;
const PASSWORD = import.meta.env.VITE_API_PASSWORD;

let accessToken = null;

export async function getAccessToken() {
  // Si ya tenemos token, reutilizamos
  if (accessToken) {
    return accessToken;
  }

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

  if (!response.ok) {
    throw new Error("Error obteniendo token JWT");
  }

  const data = await response.json();
  accessToken = data.access;

  return accessToken;
}
