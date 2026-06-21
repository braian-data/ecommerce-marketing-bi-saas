"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function VitrineCliente() {
  const router = useRouter();
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("user_role");

    if (!token || role !== "CLIENTE") {
      router.push("/login");
      return;
    }

    const fetchProdutos = async () => {
      try {
        const res = await axios.get("http://localhost:8001/api/produtos/", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProdutos(res.data);
      } catch (err) {
        console.error("Erro ao carregar produtos", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProdutos();
  }, [router]);

  if (loading) return <div className="p-10 text-white">Carregando catálogo...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Nossos Produtos</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {produtos.map((p: any) => (
          <div key={p.id} className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-bold">{p.nome}</h3>
            <p className="text-gray-400 text-sm mt-2">{p.descricao}</p>
            <button className="mt-4 w-full bg-blue-600 py-2 rounded">Adicionar ao Carrinho</button>
          </div>
        ))}
      </div>
    </div>
  );
}
