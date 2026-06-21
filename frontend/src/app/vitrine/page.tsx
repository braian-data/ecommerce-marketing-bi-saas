"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function VitrineGlobal() {
  const router = useRouter();
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados Transacionais do Cliente
  const [saldo, setSaldo] = useState(0);
  const [carrinhos, setCarrinhos] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const getToken = () => localStorage.getItem("access_token");

  // Busca catálogo global (Público)
  const fetchCatalogo = async () => {
    try {
      const response = await axios.get("http://localhost:8001/api/vitrine/");
      setProdutos(response.data);
    } catch (error) {
      console.error("Erro de requisição catálogo:", error);
    } finally {
      setLoading(false);
    }
  };

  // Busca carteira e carrinho (Autenticado)
  const fetchEstadoCliente = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const response = await axios.get("http://localhost:8001/api/carrinho/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSaldo(response.data.saldo_disponivel);
      setCarrinhos(response.data.carrinhos);
    } catch (error) {
      console.error("Sessão de cliente ausente ou inválida.");
    }
  };

  useEffect(() => {
    fetchCatalogo();
    fetchEstadoCliente();
  }, []);

  // I/O: Adicionar ao Carrinho
  const handleComprar = async (produtoId: number) => {
    const token = getToken();
    if (!token) {
      alert("Autenticação obrigatória. Faça login como Cliente Final.");
      router.push("/login");
      return;
    }

    try {
      await axios.post("http://localhost:8001/api/carrinho/", 
        { produto_id: produtoId, quantidade: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchEstadoCliente(); 
      setIsCartOpen(true); 
    } catch (error: any) {
      alert(error.response?.data?.erro || "Falha ao adicionar ao carrinho.");
    }
  };

  // I/O: Simulação de Depósito Fictício
  const handleDeposito = async () => {
    const token = getToken();
    if (!token) return alert("Sessão expirada.");
    
    const valorInput = prompt("Digite o valor para depósito (Ex: 1000):");
    if (!valorInput) return;
    
    const valor = parseFloat(valorInput.replace(',', '.'));
    if (isNaN(valor) || valor <= 0) return alert("Valor numérico inválido.");

    try {
      await axios.post("http://localhost:8001/api/carteira/deposito/",
        { valor: valor },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchEstadoCliente(); 
    } catch (error: any) {
      alert(error.response?.data?.erro || "Falha na transação.");
    }
  };

  // I/O: Processamento de Checkout
  const handleCheckout = async (carrinhoId: number) => {
    const token = getToken();
    try {
      await axios.post("http://localhost:8001/api/checkout/", 
        { carrinho_id: carrinhoId, metodo_pagamento: 'PIX' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Pagamento aprovado! O saldo foi deduzido da sua carteira e transferido para o lojista.");
      fetchEstadoCliente(); 
    } catch (error: any) {
      alert(error.response?.data?.erro || "Falha na transação de checkout.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  // Cálculo de itens totais no badge
  const totalItensCarrinho = carrinhos.reduce((acc, car: any) => 
    acc + car.itens.reduce((sum: number, item: any) => sum + item.quantidade, 0), 0
  );

  if (loading) return <div className="p-8 text-white bg-gray-900 min-h-screen">Carregando infraestrutura...</div>;

  return (
    <div className="bg-gray-900 min-h-screen text-white font-sans relative">
      <header className="p-6 bg-gray-800 border-b border-gray-700 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold">Explorar Lojas</h1>
          <p className="text-sm text-gray-400">Ambiente Cliente Final (B2C)</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-gray-700 px-4 py-2 rounded flex flex-col items-end">
            <span className="text-xs text-gray-400">Carteira Digital</span>
            <span className="font-bold text-green-400">R$ {parseFloat(saldo.toString()).toFixed(2)}</span>
          </div>
          <button onClick={handleDeposito} className="bg-green-700 hover:bg-green-600 px-3 py-2 rounded font-bold text-sm transition-colors">
            + Depositar
          </button>
          <button 
            onClick={() => setIsCartOpen(!isCartOpen)} 
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-bold transition-colors flex items-center gap-2"
          >
            🛒 Carrinho <span className="bg-white text-blue-900 px-2 rounded-full text-xs">{totalItensCarrinho}</span>
          </button>
          <button onClick={handleLogout} className="bg-red-600 px-4 py-2 rounded font-bold hover:bg-red-700 transition-colors ml-4">
            Sair
          </button>
        </div>
      </header>

      <main className="p-8">
        {produtos.length === 0 ? (
          <div className="bg-gray-800 border border-gray-700 p-12 rounded text-center shadow-lg max-w-3xl mx-auto mt-10">
            <h2 className="text-2xl font-bold text-green-400 mb-2">Catálogo Global Vazio</h2>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {produtos.map((prod: any) => {
              const urlImagem = prod.imagem ? (prod.imagem.startsWith('http') ? prod.imagem : `http://localhost:8001${prod.imagem}`) : null;

              return (
                <div key={prod.id} className="bg-gray-800 rounded border border-gray-700 overflow-hidden flex flex-col hover:border-blue-500 transition-colors shadow-lg">
                  {urlImagem ? (
                    <img src={urlImagem} alt={prod.nome} className="w-full h-48 object-cover" />
                  ) : (
                    <div className="w-full h-48 bg-gray-700 flex items-center justify-center text-gray-400 text-sm">Sem Imagem</div>
                  )}
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="text-xs text-blue-400 font-bold mb-1 uppercase tracking-wider">{prod.nome_loja}</div>
                    <h3 className="font-bold text-lg mb-2 text-white">{prod.nome}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2 mb-4 flex-grow">{prod.descricao}</p>
                    <div className="flex justify-between items-center mt-auto border-t border-gray-700 pt-4">
                      <span className="text-xl font-bold text-green-400">R$ {parseFloat(prod.preco).toFixed(2)}</span>
                      <button 
                        onClick={() => handleComprar(prod.id)}
                        className="bg-blue-600 px-4 py-2 rounded text-sm font-bold hover:bg-blue-700 transition-colors"
                      >
                        Comprar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Painel Lateral do Carrinho (Overlay) */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-end">
          <div className="bg-gray-800 w-full max-w-md h-full shadow-2xl flex flex-col overflow-hidden border-l border-gray-700 animate-slide-in-right">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-900">
              <h2 className="text-xl font-bold">🛒 Seu Carrinho</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-white text-2xl font-bold">&times;</button>
            </div>

            <div className="flex-grow overflow-y-auto p-6">
              {carrinhos.length === 0 ? (
                <div className="text-center text-gray-500 mt-10">O seu carrinho está vazio.</div>
              ) : (
                carrinhos.map((car: any) => (
                  <div key={car.carrinho_id} className="mb-6 bg-gray-700 rounded p-4 border border-gray-600">
                    <h3 className="font-bold text-blue-400 border-b border-gray-600 pb-2 mb-3">Loja: {car.loja_nome}</h3>
                    
                    {car.itens.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center mb-2 text-sm">
                        <div>
                          <span className="text-gray-300">{item.quantidade}x </span>
                          <span className="font-semibold">{item.nome}</span>
                        </div>
                        <span className="text-green-400">R$ {parseFloat(item.subtotal).toFixed(2)}</span>
                      </div>
                    ))}
                    
                    {/* Bloco de Checkout aninhado corretamente dentro do map de carrinhos */}
                    <div className="mt-4 pt-3 border-t border-gray-600 flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Total da Loja:</span>
                        <span className="font-bold text-lg">R$ {parseFloat(car.total).toFixed(2)}</span>
                      </div>
                      <button 
                        onClick={() => handleCheckout(car.carrinho_id)}
                        className="w-full bg-green-600 hover:bg-green-700 py-2 rounded font-bold transition-colors text-sm"
                      >
                        Pagar Carrinho (R$ {parseFloat(car.total).toFixed(2)})
                      </button>
                    </div>

                  </div>
                ))
              )}
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}