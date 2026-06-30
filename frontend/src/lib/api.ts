// frontend/src/lib/api.ts
import axios from 'axios';

// Isso diz ao código: "Use a variável de ambiente (no Netlify) ou, se não achar, use a Render"
const baseURL = process.env.NEXT_PUBLIC_API_URL || "https://ecommerce-api-kh18.onrender.com";

const api = axios.create({
  baseURL: baseURL,
});

export default api;

export const getImageUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const BASE = process.env.NEXT_PUBLIC_API_URL || "https://ecommerce-api-kh18.onrender.com";
  return `${BASE}${path}`;
};