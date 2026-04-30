import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, ShoppingCart, Package, DollarSign, Smartphone, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Dashboard from "./views/Dashboard";
import POS from "./views/POS";
import Products from "./views/Products";
import Finance from "./views/Finance";
import Mobile from "./views/Mobile";

function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (val: boolean) => void }) {
  const location = useLocation();
  
  const menuItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Caixa (POS)", path: "/pos", icon: ShoppingCart },
    { name: "Produtos", path: "/products", icon: Package },
    { name: "Finanças", path: "/finance", icon: DollarSign },
    { name: "Mobile Scan", path: "/mobile", icon: Smartphone },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -280 }}
        className="fixed top-0 left-0 bottom-0 w-64 bg-slate-900 text-white z-50 lg:translate-x-0 transition-transform duration-300"
      >
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">Gestão <span className="text-blue-400">360</span></h1>
          <button className="lg:hidden" onClick={() => setIsOpen(false)}><X size={20} /></button>
        </div>

        <nav className="mt-6 px-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <button className="flex items-center gap-3 text-slate-400 hover:text-red-400 w-full transition-colors">
            <LogOut size={20} />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
}

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 flex">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        
        <main className="flex-1 lg:ml-64 flex flex-col min-h-screen">
          <header className="h-16 border-b bg-white flex items-center px-6 lg:px-10 justify-between sticky top-0 z-30">
            <button className="lg:hidden" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold">Administrador</p>
                <p className="text-xs text-slate-500">Offline</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border-2 border-white shadow-sm">
                A
              </div>
            </div>
          </header>

          <div className="p-6 lg:p-10">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/pos" element={<POS />} />
              <Route path="/products" element={<Products />} />
              <Route path="/finance" element={<Finance />} />
              <Route path="/mobile" element={<Mobile />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}
