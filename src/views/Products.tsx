import { useState, useEffect } from "react";
import { Plus, Edit3, Trash2, Search, Package, AlertTriangle } from "lucide-react";

interface Product {
  id?: number;
  name: string;
  price: number;
  stock: number;
  barcode: string;
  category: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState<Product>({
    name: "",
    price: 0,
    stock: 0,
    barcode: "",
    category: "Geral"
  });

  const fetchProducts = () => {
    fetch("/api/products").then(res => res.json()).then(setProducts);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingProduct ? "PUT" : "POST";
    const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setIsModalOpen(false);
      setEditingProduct(null);
      setFormData({ name: "", price: 0, stock: 0, barcode: "", category: "Geral" });
      fetchProducts();
    }
  };

  const handleEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData(p);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    fetchProducts();
  };

  const lowStockProducts = products.filter(p => p.stock < 5);
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.barcode?.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gerenciamento de Estoque</h1>
          <p className="text-slate-500">Cadastre e controle seus produtos offline.</p>
        </div>
        <button 
          onClick={() => { setEditingProduct(null); setFormData({ name: "", price: 0, stock: 0, barcode: "", category: "Geral" }); setIsModalOpen(true); }}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          Novo Produto
        </button>
      </div>

      {lowStockProducts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center gap-3 text-amber-800">
          <AlertTriangle className="text-amber-500" />
          <p className="text-sm font-medium">Você tem {lowStockProducts.length} produtos com estoque baixo!</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-lg border w-full max-w-md">
            <Search size={18} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Pesquisar estoque..." 
              className="bg-transparent outline-none text-sm w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Produto</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Preço</th>
                <th className="px-6 py-4">Estoque</th>
                <th className="px-6 py-4">Cód. Barras</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-400">
                        <Package size={16} />
                      </div>
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{p.category}</td>
                  <td className="px-6 py-4 text-sm font-bold">{p.price.toFixed(2)} MT</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${p.stock < 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {p.stock} un
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{p.barcode || "N/A"}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(p)} className="p-2 hover:bg-slate-200 rounded-lg transition"><Edit3 size={16} className="text-slate-600" /></button>
                      <button onClick={() => handleDelete(p.id!)} className="p-2 hover:bg-red-50 rounded-lg transition"><Trash2 size={16} className="text-red-500" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6">
            <h2 className="text-xl font-bold mb-6">{editingProduct ? "Editar Produto" : "Novo Produto"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-500 block mb-1">Nome do Produto</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Preço (MT)</label>
                  <input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} className="w-full border rounded-xl p-2.5 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Estoque</label>
                  <input type="number" required value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} className="w-full border rounded-xl p-2.5 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Cód. Barras</label>
                  <input type="text" value={formData.barcode} onChange={e => setFormData({...formData, barcode: e.target.value})} className="w-full border rounded-xl p-2.5 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Categoria</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border rounded-xl p-2.5 outline-none">
                    <option value="Geral">Geral</option>
                    <option value="Alimentos">Alimentos</option>
                    <option value="Bebidas">Bebidas</option>
                    <option value="Limpeza">Limpeza</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold hover:bg-slate-200">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
