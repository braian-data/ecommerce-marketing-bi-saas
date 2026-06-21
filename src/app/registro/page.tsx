"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Registro() {
  const router = useRouter();
  const [formData, setFormData] = useState({ nome: "", cpf: "", email: "", senha: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8001/api/registro-cliente/", formData);
      router.push("/login"); // Redireciona para o login após criar
    } catch (err) {
      alert("Erro ao registrar cliente.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded shadow-lg w-full max-w-sm">
        <h2 className="mb-4">Criar Conta</h2>
        <input type="text" placeholder="Nome" onChange={(e) => setFormData({...formData, nome: e.target.value})} className="w-full mb-4 p-2 bg-gray-700 rounded"/>
        <input type="text" placeholder="CPF" onChange={(e) => setFormData({...formData, cpf: e.target.value})} className="w-full mb-4 p-2 bg-gray-700 rounded"/>
        <input type="email" placeholder="Email" onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full mb-4 p-2 bg-gray-700 rounded"/>
        <input type="password" placeholder="Senha" onChange={(e) => setFormData({...formData, senha: e.target.value})} className="w-full mb-4 p-2 bg-gray-700 rounded"/>
        <button className="w-full bg-blue-600 p-2 rounded">Cadastrar</button>
      </form>
    </div>
  );
}

