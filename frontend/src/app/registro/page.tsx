"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegistroSaaS() {
  const router = useRouter();
  const [tipoConta, setTipoConta] = useState("LOJISTA");
  const [planos, setPlanos] = useState([]);
  const [statusReq, setStatusReq] = useState({ tipo: "", mensagem: "" });

  const [formData, setFormData] = useState({ 
    plano: "", 
    email_adm: "", 
    login: "", 
    senha: "",
    cpf: "",
    nome: ""
  });

  useEffect(() => {
    const urlBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";
    axios.get(`${urlBase}/api/planos/`)
      .then(response => {
        setPlanos(response.data);
        if (Array.isArray(response.data) && response.data.length > 0) {
          setFormData(prev => ({ ...prev, plano: response.data[0].id }));
        }
      })
      .catch(() => {
        setStatusReq({ tipo: "erro", mensagem: "Não foi possível carregar os planos." });
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusReq({ tipo: "info", mensagem: "Processando registro..." });

    try {
      const urlBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";
      const endpoint = tipoConta === "LOJISTA" ? "/api/registro-vendedor/" : "/api/registro-cliente/";
      
      const payload = tipoConta === "LOJISTA" 
        ? { plano: formData.plano, email_adm: formData.email_adm, login: formData.login, senha: formData.senha }
        : { cpf: formData.cpf, nome: formData.nome, email: formData.email_adm, senha: formData.senha };

      await axios.post(`${urlBase}${endpoint}`, payload);
      
      setStatusReq({ tipo: "sucesso", mensagem: "Conta criada com sucesso!" });
      setTimeout(() => router.push("/login"), 2000);
      
    } catch (error: any) {
      const msgErro = error.response?.data?.erro || "Erro na comunicação com o servidor.";
      setStatusReq({ tipo: "erro", mensagem: msgErro });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 py-12">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Criação de Conta</h2>

        <div className="flex mb-6 space-x-2">
          <button onClick={() => setTipoConta("LOJISTA")} className={`flex-1 py-2 rounded-md text-sm font-medium ${tipoConta === "LOJISTA" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-400"}`}>Sou Lojista</button>
          <button onClick={() => setTipoConta("CLIENTE")} className={`flex-1 py-2 rounded-md text-sm font-medium ${tipoConta === "CLIENTE" ? "bg-green-600 text-white" : "bg-gray-700 text-gray-400"}`}>Sou Cliente Final</button>
        </div>
        
        {statusReq.mensagem && (
          <div className={`p-4 mb-4 text-sm rounded-lg ${statusReq.tipo === "erro" ? "bg-red-900/50 text-red-400" : "bg-green-900/50 text-green-400"}`}>
            {statusReq.mensagem}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {tipoConta === "LOJISTA" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300">Plano</label>
                <select name="plano" value={formData.plano} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded text-white">
                  {planos.map((p: any) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Login</label>
                <input type="text" name="login" required onChange={handleChange} className="w-full bg-gray-700 p-2 rounded text-white" />
              </div>
            </>
          )}

          {tipoConta === "CLIENTE" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300">Nome</label>
                <input type="text" name="nome" required onChange={handleChange} className="w-full bg-gray-700 p-2 rounded text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">CPF</label>
                <input type="text" name="cpf" required onChange={handleChange} className="w-full bg-gray-700 p-2 rounded text-white" />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300">E-mail</label>
            <input type="email" name="email_adm" required onChange={handleChange} className="w-full bg-gray-700 p-2 rounded text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Senha</label>
            <input type="password" name="senha" required onChange={handleChange} className="w-full bg-gray-700 p-2 rounded text-white" />
          </div>
          
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded mt-6">Registrar</button>
        </form>
      </div>
    </div>
  );
}