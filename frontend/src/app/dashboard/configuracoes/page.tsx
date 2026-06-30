"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
// Importando a instância centralizada que criamos
import { api } from "@/lib/api"; 

export default function ConfiguracoesConta() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", senha_atual: "", nova_senha: "" });
  const [statusReq, setStatusReq] = useState({ tipo: "", mensagem: "" });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 1. Atualização de Dados (PUT)
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusReq({ tipo: "info", mensagem: "Processando atualização..." });
    const token = localStorage.getItem("access_token");

    try {
      // Usando 'api' em vez de 'axios'. A URL base já está configurada nele.
      const response = await api.put("/api/usuario/me/", formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatusReq({ tipo: "sucesso", mensagem: response.data.mensagem || "Conta atualizada com sucesso." });
      setFormData({ email: "", senha_atual: "", nova_senha: "" });
    } catch (error: any) {
      const msgErro = error.response?.data?.erro || "Erro ao atualizar dados.";
      setStatusReq({ tipo: "erro", mensagem: msgErro });
    }
  };

  // 2. Exclusão de Conta (DELETE)
  const handleDelete = async () => {
    if (!window.confirm("ATENÇÃO: A exclusão da conta de Administrador apagará TODAS as lojas e dados vinculados. Confirmar?")) return;
    
    setIsDeleting(true);
    const token = localStorage.getItem("access_token");

    try {
      // Usando 'api' em vez de 'axios'
      await api.delete("/api/usuario/me/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Sua conta e lojas foram deletadas permanentemente.");
      localStorage.clear();
      router.push("/login");
    } catch (error: any) {
      alert(error.response?.data?.erro || "Falha crítica ao excluir conta.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-lg shadow-xl border border-gray-700">
        
        <div className="flex items-center gap-4 mb-8 border-b border-gray-700 pb-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition">← Voltar</Link>
          <h1 className="text-2xl font-bold">Configurações do Lojista</h1>
        </div>

        {statusReq.mensagem && (
          <div className={`p-4 mb-6 rounded text-sm font-semibold ${statusReq.tipo === 'erro' ? 'bg-red-900/50 text-red-400 border border-red-800' : statusReq.tipo === 'sucesso' ? 'bg-green-900/50 text-green-400 border border-green-800' : 'bg-blue-900/50 text-blue-400'}`}>
            {statusReq.mensagem}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-5 mb-10">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Novo E-mail Administrativo</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded p-3 text-white" placeholder="Deixe em branco para manter o atual" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Senha Atual (Obrigatório para trocas)</label>
              <input type="password" name="senha_atual" value={formData.senha_atual} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded p-3 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Nova Senha</label>
              <input type="password" name="nova_senha" value={formData.nova_senha} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded p-3 text-white" />
            </div>
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded font-bold transition">
            Salvar Alterações de Segurança
          </button>
        </form>

        <div className="pt-8 border-t border-red-900/50 mt-8">
          <h3 className="text-xl font-bold text-red-500 mb-2">Zona de Perigo</h3>
          <p className="text-sm text-gray-400 mb-4">Ao deletar sua conta, não haverá retorno. Tenha certeza.</p>
          <button 
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-700 hover:bg-red-600 text-white font-bold py-3 px-6 rounded disabled:opacity-50 transition"
          >
            {isDeleting ? "Processando Exclusão..." : "Excluir Conta Permanentemente"}
          </button>
        </div>
        
      </div>
    </div>
  );
}