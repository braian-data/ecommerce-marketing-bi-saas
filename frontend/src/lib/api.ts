// frontend/src/lib/api.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ecommerce-api-kh18.onrender.com";

// ALTERAÇÃO: Adicione 'export' aqui e remova o 'export default api' lá embaixo
export const api = axios.create({
  baseURL: API_URL,
});

export const getImageUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const BASE = process.env.NEXT_PUBLIC_API_URL || "https://ecommerce-api-kh18.onrender.com";
  return `${BASE}${path}`;
};

// REMOVA a linha 'export default api;' que existia antes.
