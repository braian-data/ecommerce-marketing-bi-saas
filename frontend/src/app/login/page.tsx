"use client";

import { useState } from "react";
// Importação centralizada. Verifique se o caminho coincide com onde você salvou seu arquivo api.ts
import { api } from "@/lib/api"; 
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({ 
    identificador: "", 
    senha: "", 
    tipo_usuario: "CLIENTE" 
  });
  const [statusReq, setStatusReq] = useState({ tipo: "", mensagem: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusReq({ tipo: "info", mensagem: "Autenticando..." });

    try {
      // urlBase removida: a instância 'api' já sabe para onde enviar
      const payload = {
        identificador: formData.identificador,
        senha: formData.senha,
        tipo_usuario: formData.tipo_usuario
      };

      // Chamada usando a instância centralizada 'api'
      const response = await api.post("/api/auth/login/", payload);
      
      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);
      localStorage.setItem("user_role", formData.tipo_usuario);

      setStatusReq({ tipo: "sucesso", mensagem: "Login aprovado. Redirecionando..." });
      
      setTimeout(() => {
        if (formData.tipo_usuario === "ADMIN") {
          router.push("/dashboard");
        } else {
          router.push("/vitrine");
        }
      }, 1500);

    } catch (error: any) {
      const msgErro = error.response?.data?.erro || error.response?.data?.detail || "Credenciais não encontradas ou inválidas.";
      setStatusReq({ tipo: "erro", mensagem: msgErro });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Acesso ao Sistema</h2>
        
        {statusReq.mensagem && (
          <div className={`p-4 mb-4 text-sm rounded-lg ${
            statusReq.tipo === "erro" ? "bg-red-900/50 text-red-400" : 
            statusReq.tipo === "sucesso" ? "bg-green-900/50 text-green-400" : "bg-blue-900/50 text-blue-400"
          }`}>
            {statusReq.mensagem}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Perfil de Acesso</label>
            <select name="tipo_usuario" value={formData.tipo_usuario} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white">
              <option value="ADMIN">Lojista (Administrador)</option>
              <option value="CLIENTE">Cliente Final</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">
              {formData.tipo_usuario === "ADMIN" ? "E-mail Administrativo ou Login" : "CPF"}
            </label>
            <input type="text" name="identificador" required value={formData.identificador} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Senha</label>
            <input type="password" name="senha" required value={formData.senha} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
          </div>
          <button type="submit" className="w-full py-2 px-4 rounded-md text-white bg-blue-600 hover:bg-blue-700 mt-6">
            Entrar
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Ainda não possui uma conta?{" "}
            <Link href="/registro" className="font-medium text-blue-500 hover:text-blue-400">
              Criar Conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}