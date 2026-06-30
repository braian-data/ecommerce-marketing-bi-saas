"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
// Importação da nossa instância centralizada (já pronta para futuras chamadas de API)
import { api } from "@/lib/api"; 

export default function DashboardLojista() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    
    // Verificação de segurança local
    if (!token || localStorage.getItem("user_role") !== "ADMIN") {
      router.push("/login");
    } else {
      setCarregando(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        Autenticando sessão...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-gray-700 pb-4 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Painel do Vendedor</h1>
            <p className="text-gray-400 text-sm mt-1">Gestão Central de Lojas (SaaS)</p>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              href="/dashboard/configuracoes" 
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Configurar Conta
            </Link>
            <button 
              onClick={handleLogout} 
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Encerrar Sessão
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-semibold mb-2 text-blue-400">1. Gestão de Lojas</h3>
            <p className="text-gray-400 text-sm mb-4">Criação de Tenants (CNPJ único) e monitorização de limites do plano atual.</p>
            <Link href="/dashboard/lojas" className="text-blue-500 hover:underline text-sm font-medium block">
              Aceder Módulo &rarr;
            </Link>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 opacity-50">
            <h3 className="text-xl font-semibold mb-2 text-gray-400">2. Catálogo (Bloqueado)</h3>
            <p className="text-gray-500 text-sm mb-4">Requer seleção de uma loja ativa para gerir inventário e imagens.</p>
            <span className="text-gray-600 text-sm font-medium cursor-not-allowed">Aceder Módulo &rarr;</span>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 opacity-50">
            <h3 className="text-xl font-semibold mb-2 text-gray-400">3. Transações (Bloqueado)</h3>
            <p className="text-gray-500 text-sm mb-4">Requer seleção de uma loja ativa para visualizar pedidos e faturamento.</p>
            <span className="text-gray-600 text-sm font-medium cursor-not-allowed">Aceder Módulo &rarr;</span>
          </div>
        </div>
      </div>
    </div>
  );
}