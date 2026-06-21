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
      // 1. Busca metadados do Inquilino (Tenant)
      const resLoja = await axios.get(`http://localhost:8001/api/lojas/${lojaId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLoja(resLoja.data);

      // 2. Busca do Catálogo de Produtos da Loja
      const resProdutos = await axios.get(`http://localhost:8001/api/lojas/${lojaId}/produtos/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProdutos(resProdutos.data);

      // 3. Busca do Histórico Transacional (Pedidos Relacionados)
      const resPedidos = await axios.get(`http://localhost:8001/api/lojas/${lojaId}/pedidos/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPedidos(resPedidos.data);

      // 4. Pipeline de Agregação do Saldo Comercial
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
      await axios.post(`http://localhost:8001/api/lojas/${lojaId}/produtos/`, formData, {
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

  useEffect(() => { 
    if (lojaId) fetchDados(); 
  }, [lojaId]);

  if (loading) return <div className="p-8 text-white bg-gray-900 min-h-screen">Carregando infraestrutura do dashboard...</div>;

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white font-sans">
      {/* Cabeçalho */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/lojas" className="bg-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-600 transition-colors">
            ← Voltar
          </Link>
          <h1 className="text-2xl font-bold">Gestão: {loja?.nome_loja}</h1>
        </div>
      </div>

      {/* Navegação por Abas (Tabs) */}
      <div className="flex border-b border-gray-700 mb-6">
        <button
          onClick={() => setAbaAtiva('catalogo')}
          className={`py-2 px-4 font-semibold transition-all ${abaAtiva === 'catalogo' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-200'}`}
        >
          Catálogo de Produtos
        </button>
        <button
          onClick={() => setAbaAtiva('transacoes')}
          className={`py-2 px-4 font-semibold transition-all ${abaAtiva === 'transacoes' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-200'}`}
        >
          Transações e Pedidos
        </button>
      </div>

      {/* Conteúdo Condicional: Módulo do Catálogo */}
      {abaAtiva === 'catalogo' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário de Input */}
          <div className="lg:col-span-1 bg-gray-800 p-6 rounded border border-gray-700 h-fit">
            <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Adicionar Produto</h2>
            <form onSubmit={handleCriarProduto} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Categoria</label>
                <input 
                  required 
                  className="w-full bg-gray-700 p-2 rounded text-white border border-transparent focus:border-blue-500 outline-none" 
                  placeholder="Ex: Acessórios"
                  value={novoProduto.categoria} 
                  onChange={e => setNovoProduto({...novoProduto, categoria: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nome do Produto</label>
                <input required className="w-full bg-gray-700 p-2 rounded text-white border border-transparent focus:border-blue-500 outline-none" value={novoProduto.nome} onChange={e => setNovoProduto({...novoProduto, nome: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Preço (R$)</label>
                <input required type="number" step="0.01" className="w-full bg-gray-700 p-2 rounded text-white border border-transparent focus:border-blue-500 outline-none" value={novoProduto.preco} onChange={e => setNovoProduto({...novoProduto, preco: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Descrição</label>
                <textarea required className="w-full bg-gray-700 p-2 rounded text-white h-24 border border-transparent focus:border-blue-500 outline-none resize-none" value={novoProduto.descricao} onChange={e => setNovoProduto({...novoProduto, descricao: e.target.value})}></textarea>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Imagem do Produto</label>
                <input 
                  id="imagem-upload"
                  type="file" 
                  accept="image/*"
                  className="w-full bg-gray-700 p-2 rounded text-white text-sm cursor-pointer" 
                  onChange={e => setNovoProduto({...novoProduto, imagem: e.target.files ? e.target.files[0] : null})} 
                />
              </div>
              <button type="submit" className="bg-blue-600 p-2 rounded font-bold hover:bg-blue-700 transition-colors mt-2">Gravar Produto</button>
            </form>
          </div>

          {/* Renderização do Grid de Cards */}
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
                    <div key={prod.id} className="bg-gray-700 rounded overflow-hidden flex flex-col justify-between border border-gray-600 shadow-md hover:border-gray-500 transition-all">
                      {urlImagem ? (
                        <img src={urlImagem} alt={prod.nome} className="w-full h-48 object-cover" />
                      ) : (
                        <div className="w-full h-48 bg-gray-800 flex items-center justify-center text-gray-500 text-sm">Sem imagem</div>
                      )}
                      <div className="p-4">
                        <h3 className="font-bold text-lg text-white">{prod.nome}</h3>
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
      )}

      {/* Conteúdo Condicional: Módulo de Transações Financeiras */}
      {abaAtiva === 'transacoes' && (
        <div className="bg-gray-800 p-6 rounded border border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h3 className="text-xl font-semibold text-white">Últimas Transações</h3>
              <p className="text-gray-400 text-sm">Histórico de compras dos clientes finais associados a esta loja.</p>
            </div>
            <div className="bg-green-950 border border-green-700 p-4 rounded text-right min-w-[200px] shadow-inner">
              <p className="text-xs text-green-400 font-semibold uppercase tracking-wider">Saldo Consolidado</p>
              <h2 className="text-2xl font-bold text-white">R$ {saldoTotal.toFixed(2)}</h2>
            </div>
          </div>
          
          <div className="overflow-x-auto rounded border border-gray-700">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-gray-900 text-gray-300 border-b border-gray-700">
                <tr>
                  <th className="p-4 font-semibold">ID Pedido</th>
                  <th className="p-4 font-semibold">Data</th>
                  <th className="p-4 font-semibold">Cliente</th>
                  <th className="p-4 font-semibold">Valor Total</th>
                  <th className="p-4 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700 bg-gray-800">
                {pedidos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500 italic">
                      Nenhum pedido localizado no banco de dados para esta loja.
                    </td>
                  </tr>
                ) : (
                  pedidos.map((pedido: any) => (
                    <tr key={pedido.id} className="hover:bg-gray-750 transition-colors">
                      <td className="p-4 font-mono text-gray-300">#{pedido.id}</td>
                      <td className="p-4">{new Date(pedido.criado_em || pedido.data || Date.now()).toLocaleDateString('pt-BR')}</td>
                      <td className="p-4 text-gray-200">{pedido.cliente_nome || pedido.cliente || 'Consumidor Final'}</td>
                      <td className="p-4 text-green-400 font-semibold">R$ {parseFloat(pedido.valor_total || 0).toFixed(2)}</td>
                      <td className="p-4 text-center">
                        <span className="bg-blue-950 text-blue-300 py-1 px-3 rounded-full text-xs font-bold border border-blue-800 uppercase">
                          {pedido.status || 'CONCLUÍDO'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}