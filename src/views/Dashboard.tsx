import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { ArrowUpRight, ArrowDownRight, Users, Package, Wallet, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalProducts: 0,
    revenue: 0,
    expenses: 0,
    recentSales: []
  });

  useEffect(() => {
    const fetchData = async () => {
      const productsReq = await fetch("/api/products");
      const salesReq = await fetch("/api/sales");
      const transReq = await fetch("/api/transactions");
      
      const products = await productsReq.json();
      const sales = await salesReq.json();
      const trans = await transReq.json();

      const revenue = trans.filter((t: any) => t.type === 'revenue').reduce((a: any, b: any) => a + b.amount, 0);
      const expenses = trans.filter((t: any) => t.type === 'expense').reduce((a: any, b: any) => a + b.amount, 0);

      setStats({
        totalSales: sales.length,
        totalProducts: products.length,
        revenue,
        expenses,
        recentSales: sales.slice(0, 5)
      });
    };
    fetchData();
  }, []);

  const data = [
    { name: "Seg", v: 4000 },
    { name: "Ter", v: 3000 },
    { name: "Qua", v: 2000 },
    { name: "Qui", v: 2780 },
    { name: "Sex", v: 1890 },
    { name: "Sab", v: 2390 },
    { name: "Dom", v: 3490 },
  ];

  const cards = [
    { name: "Vendas Online", value: stats.totalSales, icon: ShoppingCart, color: "bg-blue-500", trend: "+12%" },
    { name: "Receita Total", value: `${stats.revenue.toLocaleString()} MT`, icon: Wallet, color: "bg-green-500", trend: "+8%" },
    { name: "Produtos", value: stats.totalProducts, icon: Package, color: "bg-purple-500", trend: "-2%" },
    { name: "Custos", value: `${stats.expenses.toLocaleString()} MT`, icon: ArrowDownRight, color: "bg-amber-500", trend: "+5%" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Resumo da sua operação local em {new Date().toLocaleDateString()}.</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-xs font-bold ring-1 ring-green-100">
           <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" />
           SISTEMA OFFLINE ATIVO
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.color} p-3 rounded-xl text-white`}>
                <TrendingUp size={24} />
              </div>
              <span className={`text-xs font-bold ${card.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {card.trend}
              </span>
            </div>
            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{card.name}</p>
            <h3 className="text-2xl font-black mt-1">{card.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-lg font-bold">Fluxo de Caixa Mensal</h3>
             <select className="bg-slate-50 border rounded-lg px-3 py-1 text-sm outline-none">
               <option>Últimos 7 dias</option>
               <option>Último mês</option>
             </select>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorV)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border uppercase">
           <h3 className="text-lg font-bold mb-6 underline decoration-blue-500 decoration-4 underline-offset-4">Vendas Recentes</h3>
           <div className="space-y-6">
             {stats.recentSales.map((sale: any) => (
                <div key={sale.id} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                    <ShoppingCart size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">Venda #{sale.id}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-tighter">via {sale.payment_method}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-blue-600">{sale.total.toFixed(2)} MT</p>
                    <p className="text-[10px] text-slate-400 lowercase">{new Date(sale.created_at).toLocaleTimeString([], {hour: '2-4', minute:'2-digit'})}</p>
                  </div>
                </div>
             ))}
             {stats.recentSales.length === 0 && <p className="text-center py-10 text-slate-400 text-xs">Nenhuma venda hoje.</p>}
           </div>
           <button className="w-full mt-6 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition">Ver Histórico Completo</button>
        </div>
      </div>
    </div>
  );
}

// Fixed import for charts
import { ShoppingCart } from "lucide-react";
