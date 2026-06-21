"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({ 
    identificador: "", 
    senha: "", 
    tipo_usuario: "ADMIN" 
  });
  const [statusReq, setStatusReq] = useState({ tipo: "", mensagem: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusReq({ tipo: "info", mensagem: "Autenticando..." });

    try {
      // Contrato de dados que o seu backend CustomLoginAPIView espera
      const payload = {
        identificador: formData.identificador,
        senha: formData.senha,
        tipo_usuario: formData.tipo_usuario
      };

      const response = await axios.post("http://localhost:8001/api/auth/login/", payload);
      
      // Persistência de sessão
      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("user_role", response.data.role);

      setStatusReq({ tipo: "sucesso", mensagem: "Login bem-sucedido!" });
      
      // Roteamento baseado na Role do JWT
      setTimeout(() => {
        router.push(response.data.role === "ADMIN" ? "/dashboard" : "/vitrine");
      }, 1000);

    } catch (error: any) {
      setStatusReq({ 
        tipo: "erro", 
        mensagem: error.response?.data?.erro || "Credenciais inválidas." 
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Acesso ao Sistema</h2>
        
        {statusReq.mensagem && (
          <div className={`p-4 mb-4 text-sm rounded-lg ${
            statusReq.tipo === "erro" ? "bg-red-900/50 text-red-400" : "bg-green-900/50 text-green-400"
          }`}>
            {statusReq.mensagem}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Perfil</label>
            <select 
              className="w-full bg-gray-700 text-white p-2 rounded"
              onChange={(e) => setFormData({...formData, tipo_usuario: e.target.value})}
            >
              <option value="ADMIN">Lojista</option>
              <option value="CLIENTE">Cliente Final</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Login (CPF/Email)</label>
            <input 
              type="text" 
              required 
              onChange={(e) => setFormData({...formData, identificador: e.target.value})} 
              className="w-full bg-gray-700 text-white p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Senha</label>
            <input 
              type="password" 
              required 
              onChange={(e) => setFormData({...formData, senha: e.target.value})} 
              className="w-full bg-gray-700 text-white p-2 rounded"
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded mt-4">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}