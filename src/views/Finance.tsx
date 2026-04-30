import { useState, useEffect } from "react";
import { DollarSign, ArrowUpCircle, ArrowDownCircle, Download, Plus } from "lucide-react";

interface Transaction {
  id: number;
  type: 'revenue' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
}

export default function Finance() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'revenue' as 'revenue' | 'expense',
    category: 'Venda',
    amount: 0,
    description: ''
  });

  const fetchTransactions = () => {
    fetch("/api/transactions").then(res => res.json()).then(setTransactions);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      setIsModalOpen(false);
      setFormData({ type: 'revenue', category: 'Venda', amount: 0, description: '' });
      fetchTransactions();
    }
  };

  const revenue = transactions.filter(t => t.type === 'revenue').reduce((a, b) => a + b.amount, 0);
  const expenses = transactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);
  const balance = revenue - expenses;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Gestão Financeira</h1>
          <p className="text-slate-500">Controle suas entradas e saídas.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-slate-200 text-slate-700 px-4 py-2 rounded-xl flex items-center gap-2 font-medium hover:bg-slate-300 transition">
             <Download size={20} /> Relatório PDF
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium hover:bg-blue-700 transition"
          >
             <Plus size={20} /> Nova Transação
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-700 rounded-xl"><ArrowUpCircle size={32} /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Receitas</p>
            <p className="text-xl font-black text-green-600">{revenue.toFixed(2)} MT</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-100 text-red-700 rounded-xl"><ArrowDownCircle size={32} /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Despesas</p>
            <p className="text-xl font-black text-red-600">{expenses.toFixed(2)} MT</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-700 rounded-xl"><DollarSign size={32} /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Saldo Total</p>
            <p className="text-xl font-black text-blue-600">{balance.toFixed(2)} MT</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
            <tr>
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4">Descrição</th>
              <th className="px-6 py-4">Categoria</th>
              <th className="px-6 py-4">Tipo</th>
              <th className="px-6 py-4 text-right">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {transactions.map(t => (
              <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm text-slate-500">{new Date(t.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 font-medium">{t.description}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-slate-100 rounded-lg text-[10px] font-bold uppercase">{t.category}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-bold uppercase tracking-tighter ${t.type === 'revenue' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'revenue' ? 'Entrada' : 'Saída'}
                  </span>
                </td>
                <td className={`px-6 py-4 text-right font-bold ${t.type === 'revenue' ? 'text-green-600' : 'text-red-600'}`}>
                  {t.type === 'revenue' ? '+' : '-'}{t.amount.toFixed(2)} MT
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h2 className="text-xl font-bold mb-6">Nova Transação</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Tipo</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setFormData({...formData, type: 'revenue'})} className={`flex-1 py-2 rounded-lg font-bold border transition ${formData.type === 'revenue' ? 'bg-green-600 text-white border-green-600' : 'bg-slate-50'}`}>Entrada</button>
                  <button type="button" onClick={() => setFormData({...formData, type: 'expense'})} className={`flex-1 py-2 rounded-lg font-bold border transition ${formData.type === 'expense' ? 'bg-red-600 text-white border-red-600' : 'bg-slate-50'}`}>Saída</button>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Descrição</label>
                <input type="text" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border rounded-xl p-2.5 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Categoria</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border rounded-xl p-2.5 outline-none">
                  <option value="Venda">Venda</option>
                  <option value="Aluguel">Aluguel</option>
                  <option value="Salários">Salários</option>
                  <option value="Reposição">Reposição</option>
                  <option value="Serviços">Serviços</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Valor (MT)</label>
                <input type="number" step="0.01" required value={formData.amount} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} className="w-full border rounded-xl p-2.5 outline-none font-bold" />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold">Registrar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
