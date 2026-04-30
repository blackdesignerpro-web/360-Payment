import { useState, useEffect } from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import { Camera, RefreshCw, ShoppingBag, UserCheck, Smartphone } from "lucide-react";

export default function Mobile() {
  const [data, setData] = useState<string>("Scanning...");
  const [scannedProduct, setScannedProduct] = useState<any>(null);
  const [faceMode, setFaceMode] = useState(false);
  const [image, setImage] = useState<string | null>(null);

  const handleScan = (err: any, result: any) => {
    if (result) {
      setData(result.text);
      fetch(`/api/products?barcode=${result.text}`)
        .then(res => res.json())
        .then(products => {
          const product = products.find((p: any) => p.barcode === result.text);
          if (product) {
            setScannedProduct(product);
          } else {
            setScannedProduct({ name: "Desconhecido", price: 0, barcode: result.text });
          }
        });
    }
  };

  const capturePhoto = () => {
    // In a real app, you'd use a canvas to capture the video stream frame
    // Here we simulate for representation
    setImage("https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop");
    alert("Biometria Facial Capturada! Salvando offline...");
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pb-20">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Assistente Mobile</h1>
        <p className="text-slate-500 text-sm">Use seu celular para funções extras.</p>
      </div>

      <div className="flex bg-white p-1 rounded-xl shadow-sm border overflow-hidden">
        <button 
          onClick={() => setFaceMode(false)}
          className={`flex-1 py-3 font-bold text-sm flex items-center justify-center gap-2 ${!faceMode ? 'bg-blue-600 text-white rounded-lg shadow-md' : 'text-slate-500'}`}
        >
          <ShoppingCart size={18} /> Scanner
        </button>
        <button 
          onClick={() => setFaceMode(true)}
          className={`flex-1 py-3 font-bold text-sm flex items-center justify-center gap-2 ${faceMode ? 'bg-blue-600 text-white rounded-lg shadow-md' : 'text-slate-500'}`}
        >
          <UserCheck size={18} /> Biometria
        </button>
      </div>

      {!faceMode ? (
        <div className="space-y-4">
          <div className="bg-slate-900 aspect-square rounded-2xl overflow-hidden relative border-4 border-white shadow-xl">
            <BarcodeScannerComponent
              width="100%"
              height="100%"
              onUpdate={handleScan}
            />
            <div className="absolute inset-0 border-2 border-blue-500/50 m-12 pointer-events-none rounded-xl">
              <div className="w-full h-0.5 bg-blue-500 absolute top-1/2 -translate-y-1/2 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Última Leitura</p>
            <p className="font-mono text-xl">{data}</p>
            
            {scannedProduct && (
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-4">
                <div className="bg-white p-2 rounded-lg shadow-sm">
                  <ShoppingBag className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-bold">{scannedProduct.name}</p>
                  <p className="text-blue-600 font-bold">{scannedProduct.price.toFixed(2)} MT</p>
                </div>
                <button className="bg-blue-600 text-white p-2 rounded-lg">+</button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="aspect-square bg-slate-200 rounded-full overflow-hidden border-4 border-white shadow-xl mx-auto relative group">
            {image ? (
              <img src={image} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-10 text-center">
                <Camera size={64} className="mb-4" />
                <p className="text-sm">Posicione o rosto no círculo</p>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/50 to-transparent">
               <button onClick={capturePhoto} className="w-full bg-white text-black py-2 rounded-lg font-bold shadow-lg hover:scale-105 transition-transform active:scale-95">
                CAPTURAR
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
             <div className="flex items-center justify-between">
                <p className="font-bold">Reconhecimento Facial</p>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Inativo</span>
             </div>
             <p className="text-xs text-slate-500 leading-relaxed">As imagens são comparadas localmente utilizando algoritmos de histograma simples. Sem conexão com a nuvem.</p>
             <button className="w-full border-2 border-slate-200 p-3 rounded-xl flex items-center justify-center gap-2 font-bold text-slate-600 hover:bg-slate-50">
               <Smartphone size={20} /> Vincular Dispositivo
             </button>
          </div>
        </div>
      )}

      <div className="fixed bottom-6 inset-x-6 lg:hidden">
         <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
               <p className="text-xs font-medium">Conectado: 192.168.1.100</p>
            </div>
            <button onClick={() => window.location.reload()}><RefreshCw size={18} /></button>
         </div>
      </div>
    </div>
  );
}
