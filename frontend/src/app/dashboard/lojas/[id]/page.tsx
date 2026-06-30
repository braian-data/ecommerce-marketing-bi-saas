"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
// Importamos a instância da API e o helper de imagem do nosso arquivo centralizador
import { api, getImageUrl } from "@/lib/api"; 
import Link from "next/link";

export default function LojaDetalhes() {
  const params = useParams();
  const lojaId = params.id;

  const [loja, setLoja] = useState<any>(null);
  const [produtos, setProdutos] = useState([]);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [saldoTotal, setSaldoTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState<'catalogo' | 'transacoes'>('catalogo');
  
  const [novoProduto, setNovoProduto] = useState({
    nome: "",
    preco: "",
    descricao: "",
    categoria: "",
    imagem: null as File | null
  });

  const fetchDados = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // 1. Busca metadados da Loja
      const resLoja = await api.get(`/api/lojas/${lojaId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLoja(resLoja.data);

      // 2. Busca do Catálogo
      const resProdutos = await api.get(`/api/lojas/${lojaId}/produtos/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProdutos(resProdutos.data);

      // 3. Busca do Histórico Transacional
      const resPedidos = await api.get(`/api/lojas/${lojaId}/pedidos/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPedidos(resPedidos.data);

      // 4. Pipeline de Agregação
      const saldoCalculado = resPedidos.data.reduce((acc: number, pedido: any) => {
        return acc + parseFloat(pedido.valor_total || 0);
      }, 0);
      setSaldoTotal(saldoCalculado);

    } catch (error) {
      console.error("Erro no pipeline de I/O de dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCriarProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    if (!token) return;
    
    const formData = new FormData();
    formData.append("nome", novoProduto.nome);
    formData.append("preco", novoProduto.preco);
    formData.append("descricao", novoProduto.descricao);
    formData.append("categoria", novoProduto.categoria);
    
    if (novoProduto.imagem) {
      formData.append("imagem", novoProduto.imagem);
    }

    try {
      await api.post(`/api/lojas/${lojaId}/produtos/`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      alert("Produto registrado na base de dados.");
      setNovoProduto({ nome: "", preco: "", descricao: "", categoria: "", imagem: null });
      
      const fileInput = document.getElementById("imagem-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      fetchDados(); 
    } catch (error: any) {
      const erroExato = error.response?.data ? JSON.stringify(error.response.data) : "Erro de rede";
      alert(`Falha de Validação (Serializer): ${erroExato}`);
    }
  };

  const handleExcluirProduto = async (produtoId: number) => {
    if (!window.confirm("Confirmar exclusão deste produto do catálogo?")) return;
    
    const token = localStorage.getItem("access_token");
    try {
      await api.delete(`/api/produtos/${produtoId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDados();
    } catch (error) {
      alert("Falha na requisição de exclusão de produto.");
    }
  };

  useEffect(() => { 
    if (lojaId) fetchDados(); 
  }, [lojaId]);

  if (loading) return <div className="p-8 text-white bg-gray-900 min-h-screen">Carregando infraestrutura...</div>;

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white font-sans">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/lojas" className="bg-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-600 transition-colors">
            ← Voltar
          </Link>
          <h1 className="text-2xl font-bold">Gestão: {loja?.nome_loja}</h1>
        </div>
      </div>

      <div className="flex border-b border-gray-700 mb-6">
        <button
          onClick={() => setAbaAtiva('catalogo')}
          className={`py-2 px-4 font-semibold ${abaAtiva === 'catalogo' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
        >
          Catálogo de Produtos
        </button>
        <button
          onClick={() => setAbaAtiva('transacoes')}
          className={`py-2 px-4 font-semibold ${abaAtiva === 'transacoes' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
        >
          Transações e Pedidos
        </button>
      </div>

      {/* Catálogo */}
      {abaAtiva === 'catalogo' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-gray-800 p-6 rounded border border-gray-700 h-fit">
            <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Adicionar Produto</h2>
            <form onSubmit={handleCriarProduto} className="flex flex-col gap-4">
              <input className="w-full bg-gray-700 p-2 rounded" placeholder="Categoria" value={novoProduto.categoria} onChange={e => setNovoProduto({...novoProduto, categoria: e.target.value})} />
              <input className="w-full bg-gray-700 p-2 rounded" placeholder="Nome" value={novoProduto.nome} onChange={e => setNovoProduto({...novoProduto, nome: e.target.value})} />
              <input type="number" className="w-full bg-gray-700 p-2 rounded" placeholder="Preço" value={novoProduto.preco} onChange={e => setNovoProduto({...novoProduto, preco: e.target.value})} />
              <textarea className="w-full bg-gray-700 p-2 rounded h-24" placeholder="Descrição" value={novoProduto.descricao} onChange={e => setNovoProduto({...novoProduto, descricao: e.target.value})}></textarea>
              <input id="imagem-upload" type="file" onChange={e => setNovoProduto({...novoProduto, imagem: e.target.files ? e.target.files[0] : null})} />
              <button type="submit" className="bg-blue-600 p-2 rounded font-bold">Gravar Produto</button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-gray-800 p-6 rounded border border-gray-700">
            {produtos.map((prod: any) => (
               <div key={prod.id} className="bg-gray-700 mb-4 p-4 rounded flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    {/* Usando a função helper getImageUrl */}
                    <img src={getImageUrl(prod.imagem)} alt={prod.nome} className="w-16 h-16 object-cover rounded" />
                    <div>
                      <h3 className="font-bold">{prod.nome}</h3>
                      <p className="text-sm text-gray-300">R$ {parseFloat(prod.preco).toFixed(2)}</p>
                    </div>
                  </div>
                  <button onClick={() => handleExcluirProduto(prod.id)} className="bg-red-700 px-3 py-1 rounded text-sm">Excluir</button>
               </div>
            ))}
          </div>
        </div>
      )}

      {/* Transações */}
      {abaAtiva === 'transacoes' && (
        <div className="bg-gray-800 p-6 rounded border border-gray-700">
          <h2 className="text-xl mb-4">Total: R$ {saldoTotal.toFixed(2)}</h2>
          {/* Tabela de pedidos aqui */}
        </div>
      )}
    </div>
  );
}