"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function LojasDashboard() {
  const [lojas, setLojas] = useState([]);
  const [formData, setFormData] = useState({ nome_loja: "", cnpj: "" });
  const [loading, setLoading] = useState(true);

  const fetchLojas = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get("http://localhost:8001/api/lojas/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLojas(response.data);
    } catch (error) {
      console.error("Erro ao carregar lojas", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const token = localStorage.getItem("access_token");
    if (!token) return alert("Token ausente. Faça login novamente.");

    try {
      await axios.post("http://localhost:8001/api/lojas/", formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      alert("Loja criada com sucesso!");
      setFormData({ nome_loja: "", cnpj: "" });
      fetchLojas();
    } catch (error: any) {
      const erroBackend = error.response?.data?.erro || error.response?.data?.detail || "Erro desconhecido";
      alert("Erro na API: " + erroBackend);
    }
  };

  useEffect(() => { 
    fetchLojas(); 
  }, []);

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6">Minhas Lojas</h1>
      
      <form onSubmit={handleCreate} className="mb-8 p-4 bg-gray-800 rounded">
        <input 
          className="bg-gray-700 p-2 mr-2 rounded text-white" 
          placeholder="Nome da Loja" 
          value={formData.nome_loja} 
          onChange={(e) => setFormData({...formData, nome_loja: e.target.value})} 
        />
        <input 
          className="bg-gray-700 p-2 mr-2 rounded text-white" 
          placeholder="CNPJ" 
          value={formData.cnpj} 
          onChange={(e) => setFormData({...formData, cnpj: e.target.value})} 
        />
        <button type="submit" className="bg-blue-600 p-2 rounded hover:bg-blue-700">
          Criar Loja
        </button>
      </form>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {lojas.map((loja: any) => (
          <Link href={`/dashboard/lojas/${loja.id}`} key={loja.id}>
            <div className="p-5 bg-gray-800 rounded border border-gray-700 hover:bg-gray-700 hover:border-blue-500 cursor-pointer transition-all duration-200 shadow-lg">
              <h2 className="text-xl font-bold text-white mb-2">{loja.nome_loja}</h2>
              <p className="text-sm text-gray-400 mb-4">CNPJ: {loja.cnpj}</p>
              <div className="text-blue-400 text-sm font-semibold">
                Acessar painel da loja →
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}