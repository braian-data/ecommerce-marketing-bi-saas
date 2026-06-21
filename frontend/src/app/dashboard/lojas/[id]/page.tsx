"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function LojaDetalhes() {
  const params = useParams();
  const lojaId = params.id;

  const [loja, setLoja] = useState<any>(null);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [novoProduto, setNovoProduto] = useState({
    nome: "",
    preco: "",
    descricao: "",
    categoria: "",
    imagem: null as File | null
  });

  const fetchDados = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return setLoading(false);

    try {
      const resLoja = await axios.get(`http://localhost:8001/api/lojas/${lojaId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLoja(resLoja.data);

      const resProdutos = await axios.get(`http://localhost:8001/api/lojas/${lojaId}/produtos/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProdutos(resProdutos.data);
    } catch (error) {
      console.error("Erro de I/O:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCriarProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    
    const formData = new FormData();
    formData.append("nome", novoProduto.nome);
    formData.append("preco", novoProduto.preco);
    formData.append("descricao", novoProduto.descricao);
    formData.append("categoria", novoProduto.categoria);
    
    if (novoProduto.imagem) {
      formData.append("imagem", novoProduto.imagem);
    }

    try {
      await axios.post(`http://localhost:8001/api/lojas/${lojaId}/produtos/`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      alert("Produto registrado na base de dados.");
      setNovoProduto({ nome: "", preco: "", descricao: "", categoria: "", imagem: null });
      
      // Limpa o input de arquivo visualmente
      const fileInput = document.getElementById("imagem-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      fetchDados(); 
    } catch (error: any) {
      const erroExato = error.response?.data ? JSON.stringify(error.response.data) : "Erro de rede";
      alert(`Falha de Validação (Serializer): ${erroExato}`);
    }
  };

  useEffect(() => { if (lojaId) fetchDados(); }, [lojaId]);

  if (loading) return <div className="p-8 text-white">Carregando infraestrutura...</div>;

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white font-sans">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/lojas" className="bg-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-600">
            ← Voltar
          </Link>
          <h1 className="text-2xl font-bold">Gestão: {loja?.nome_loja}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-gray-800 p-6 rounded border border-gray-700 h-fit">
          <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Adicionar Produto</h2>
          <form onSubmit={handleCriarProduto} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Categoria</label>
              <input 
                required 
                className="w-full bg-gray-700 p-2 rounded text-white" 
                placeholder="Ex: Acessórios"
                value={novoProduto.categoria} 
                onChange={e => setNovoProduto({...novoProduto, categoria: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nome do Produto</label>
              <input required className="w-full bg-gray-700 p-2 rounded text-white" value={novoProduto.nome} onChange={e => setNovoProduto({...novoProduto, nome: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Preço (R$)</label>
              <input required type="number" step="0.01" className="w-full bg-gray-700 p-2 rounded text-white" value={novoProduto.preco} onChange={e => setNovoProduto({...novoProduto, preco: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Descrição</label>
              <textarea required className="w-full bg-gray-700 p-2 rounded text-white h-24" value={novoProduto.descricao} onChange={e => setNovoProduto({...novoProduto, descricao: e.target.value})}></textarea>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Imagem do Produto</label>
              <input 
                id="imagem-upload"
                type="file" 
                accept="image/*"
                className="w-full bg-gray-700 p-2 rounded text-white text-sm" 
                onChange={e => setNovoProduto({...novoProduto, imagem: e.target.files ? e.target.files[0] : null})} 
              />
            </div>
            <button type="submit" className="bg-blue-600 p-2 rounded font-bold hover:bg-blue-700 mt-2">Gravar Produto</button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-gray-800 p-6 rounded border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Catálogo da Loja</h2>
          {produtos.length === 0 ? (
            <div className="text-gray-500 py-8 text-center border-2 border-dashed border-gray-700 rounded">
              Nenhum produto cadastrado nesta vitrine.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {produtos.map((prod: any) => {
                const valorBruto = prod.preco || prod.valor || 0;
                let urlImagem = null;
                if (prod.imagem) {
                   urlImagem = prod.imagem.startsWith('http') ? prod.imagem : `http://localhost:8001${prod.imagem}`;
                }

                return (
                  <div key={prod.id} className="bg-gray-700 rounded overflow-hidden flex flex-col justify-between border border-gray-600">
                    {urlImagem ? (
                      <img src={urlImagem} alt={prod.nome} className="w-full h-48 object-cover" />
                    ) : (
                      <div className="w-full h-48 bg-gray-800 flex items-center justify-center text-gray-500 text-sm">Sem imagem</div>
                    )}
                    <div className="p-4">
                      <h3 className="font-bold text-lg">{prod.nome}</h3>
                      <p className="text-sm text-gray-300 mt-1 line-clamp-2">{prod.descricao}</p>
                      <div className="mt-4 flex justify-between items-center">
                        <span className="text-green-400 font-bold">R$ {parseFloat(valorBruto).toFixed(2)}</span>
                        <button className="text-xs bg-red-900 text-red-100 px-2 py-1 rounded hover:bg-red-700 transition-colors">Excluir</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}