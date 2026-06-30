import axios from 'axios';

// Centraliza a lógica de ambiente em um único ponto
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://ecommerce-api-kh18.onrender.com",
});