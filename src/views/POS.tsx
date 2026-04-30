import { useState, useEffect } from "react";
import { Plus, Trash2, ShoppingCart, Search, CreditCard, Banknote, ReceiptText } from "lucide-react";
import { jsPDF } from "jspdf";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  barcode: string;
  category: string;
}

interface CartItem extends Product {
  quantity: number;
}

export default function POS() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  useEffect(() => {
    fetch("/api/products").then(res => res.json()).then(setProducts);
  }, []);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          total,
          payment_method: paymentMethod,
          items: cart
        }),
      });

      if (res.ok) {
        generateReceipt();
        setCart([]);
        // Refresh products for stock
        fetch("/api/products").then(res => res.json()).then(setProducts);
        alert("Venda realizada com sucesso!");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const generateReceipt = () => {
    const doc = new jsPDF({ format: [80, 150] }); // Thermal printer size
    doc.setFont("helvetica", "bold");
    doc.text("GESTAO 360", 40, 10, { align: "center" });
    doc.setFontSize(8);
    doc.text("----------------------------------------", 40, 15, { align: "center" });
    doc.text("RECIBO DE VENDA", 40, 20, { align: "center" });
    doc.text(`Data: ${new Date().toLocaleString()}`, 10, 30);
    doc.text("----------------------------------------", 40, 35, { align: "center" });
    
    let y = 40;
    cart.forEach(item => {
      doc.text(`${item.name} x${item.quantity}`, 10, y);
      doc.text(`${(item.price * item.quantity).toFixed(2)}`, 70, y, { align: "right" });
      y += 5;
    });

    doc.text("----------------------------------------", 40, y, { align: "center" });
    y += 5;
    doc.setFontSize(10);
    doc.text(`TOTAL: ${total.toFixed(2)} MT`, 70, y, { align: "right" });
    y += 10;
    doc.text("OBRIGADO PELA PREFERENCIA!", 40, y, { align: "center" });
    
    doc.save(`recibo_${Date.now()}.pdf`);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.barcode?.includes(search)
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Product Selection */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center gap-4 bg-white p-2 px-4 rounded-xl shadow-sm border">
          <Search className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Pesquisar por nome ou código de barras..." 
            className="flex-1 outline-none py-2 bg-transparent"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredProducts.map(product => (
            <button 
              key={product.id}
              onClick={() => addToCart(product)}
              disabled={product.stock <= 0}
              className={`bg-white p-4 rounded-xl border text-left shadow-sm hover:border-blue-500 hover:ring-2 hover:ring-blue-50 ring-offset-0 transition-all ${product.stock <= 0 ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
            >
              <div className="w-full aspect-square bg-slate-100 rounded-lg mb-3 flex items-center justify-center text-slate-400">
                <Package size={32} />
              </div>
              <h3 className="font-semibold text-sm line-clamp-1">{product.name}</h3>
              <p className="text-blue-600 font-bold mt-1">{product.price.toFixed(2)} MT</p>
              <p className="text-[10px] text-slate-500 mt-1">Estoque: {product.stock}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Cart & Checkout */}
      <div className="bg-white rounded-2xl shadow-lg border p-6 h-fit sticky top-24">
        <div className="flex items-center gap-2 mb-6 border-b pb-4">
          <ShoppingCart className="text-blue-600" />
          <h2 className="text-xl font-bold">Carrinho</h2>
        </div>

        <div className="space-y-4 max-h-[400px] overflow-y-auto mb-6 pr-2">
          {cart.length === 0 && (
            <div className="text-center py-10 opacity-50">
              <ReceiptText size={48} className="mx-auto mb-2" />
              <p>Carrinho vazio</p>
            </div>
          )}
          {cart.map(item => (
            <div key={item.id} className="flex justify-between items-center group">
              <div>
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-xs text-slate-500">{item.quantity}x {item.price.toFixed(2)} MT</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="font-bold">{(item.price * item.quantity).toFixed(2)}</p>
                <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 space-y-4">
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total</span>
            <span className="text-blue-600">{total.toFixed(2)} MT</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'Cash', icon: Banknote, label: 'Dinheiro' },
              { id: 'M-Pesa', icon: Smartphone, label: 'M-Pesa' },
              { id: 'Card', icon: CreditCard, label: 'Cartão' },
              { id: 'Other', icon: ReceiptText, label: 'Outro' }
            ].map(method => (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                  paymentMethod === method.id 
                    ? "bg-blue-50 border-blue-600 text-blue-600 shadow-sm" 
                    : "hover:bg-slate-50 grayscale hover:grayscale-0"
                }`}
              >
                <method.icon size={20} />
                <span className="text-[10px] mt-1 font-medium">{method.label}</span>
              </button>
            ))}
          </div>

          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 active:scale-95 transition-transform"
          >
            FINALIZAR VENDA
          </button>
        </div>
      </div>
    </div>
  );
}
