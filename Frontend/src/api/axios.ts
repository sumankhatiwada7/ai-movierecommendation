import axios from "axios";

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL ?? "http://localhost:3000"}/api/v1`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    } as typeof config.headers;
  }

  return config;
});

