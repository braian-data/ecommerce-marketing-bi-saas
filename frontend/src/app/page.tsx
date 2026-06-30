"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("user_role");

    if (token) {
      // Se já está logado, manda para o dashboard ou vitrine
      router.push(role === "ADMIN" ? "/dashboard" : "/vitrine");
    } else {
      // Se não está logado, manda para o login
      router.push("/login");
    }
  }, [router]);

  // Enquanto redireciona, mostra um carregamento simples
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
      Carregando...
    </div>
  );
}