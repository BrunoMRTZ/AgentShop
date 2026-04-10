import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Bot, QrCode, CreditCard, Package, Truck, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';

export function CheckoutAgent({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { clearCart } = useCart();
  const [step, setStep] = useState<'method' | 'pix' | 'card' | 'processing' | 'tracking'>('method');
  const [trackingStage, setTrackingStage] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setStep('method');
      setTrackingStage(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSimulatePayment = () => {
    setStep('processing');
    setTimeout(() => {
      clearCart();
      setStep('tracking');
      
      setTimeout(() => setTrackingStage(1), 2500); // Separação / Faturado
      setTimeout(() => setTrackingStage(2), 5500); // Em trânsito (Correios/Jadlog)
      setTimeout(() => setTrackingStage(3), 8500); // Entregue
    }, 3000);
  };

  const agentMessages = {
    method: "Olá! Sou seu Agente de Pagamentos. Como prefere finalizar sua compra hoje? Ofereço PIX seguro ou Cartão de Crédito.",
    pix: "Excelente escolha! Gere o pagamento pelo QR Code. Estou monitorando o gateway do banco em tempo real...",
    card: "Entendido! Conectei-me a um túnel criptografado seguro ponta-a-ponta. Seus dados estão 100% protegidos.",
    processing: "Aguarde um instante... Estou enviando a transação para aprovação e ativando a logística.",
    tracking: "Sucesso! O pagamento foi aprovado e agora eu assumi o controle da sua logística. Acompanhe abaixo em tempo real."
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-slide-in">
        {/* Header do Agente */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white flex gap-4 items-start sm:items-center">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 sm:mt-0">
             <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
               Checkout Agentic <span className="bg-emerald-400 w-2 h-2 rounded-full animate-pulse"></span>
            </h2>
            <p className="text-sm opacity-95 mt-1 leading-relaxed">{agentMessages[step]}</p>
          </div>
        </div>
        
        {/* Container Principal */}
        <div className="p-6 sm:p-8 bg-gray-50 flex-1 relative overflow-y-auto max-h-[70vh]">
           {step === 'method' && (
             <div className="grid sm:grid-cols-2 gap-4">
               <button onClick={() => setStep('pix')} className="bg-white p-6 rounded-xl border border-gray-200 hover:border-violet-500 shadow-sm hover:shadow-md transition-all text-left group">
                 <QrCode className="w-8 h-8 text-violet-600 mb-4 group-hover:scale-110 transition-transform" />
                 <h3 className="font-bold text-gray-900 text-lg">PIX</h3>
                 <p className="text-sm text-gray-500 mt-2">Aprovação imediata do agente.</p>
               </button>
               <button onClick={() => setStep('card')} className="bg-white p-6 rounded-xl border border-gray-200 hover:border-violet-500 shadow-sm hover:shadow-md transition-all text-left group">
                 <CreditCard className="w-8 h-8 text-violet-600 mb-4 group-hover:scale-110 transition-transform" />
                 <h3 className="font-bold text-gray-900 text-lg">Cartão de Crédito</h3>
                 <p className="text-sm text-gray-500 mt-2">Parcele suas compras de forma segura.</p>
               </button>
             </div>
           )}

           {step === 'pix' && (
             <div className="bg-white p-8 rounded-xl border border-gray-200 text-center max-w-sm mx-auto shadow-sm">
                <div className="w-56 h-56 bg-gray-100 mx-auto rounded-xl mb-6 flex flex-col items-center justify-center border border-gray-300">
                  <QrCode className="w-32 h-32 text-gray-400" />
                  <span className="text-[10px] text-gray-400 font-bold uppercase mt-2 w-32 truncate tracking-widest gap-2">QR Code Gerado</span>
                </div>
                <button onClick={handleSimulatePayment} className="w-full bg-violet-600 text-white py-3.5 rounded-xl font-bold hover:bg-violet-700 transition flex items-center justify-center gap-2">
                   <ShieldCheck className="w-5 h-5"/> Pagar via PIX (Simulação)
                </button>
                <button onClick={() => setStep('method')} className="w-full text-gray-500 mt-4 text-sm font-medium hover:text-gray-700">← Voltar e escolher outro</button>
             </div>
           )}

           {step === 'card' && (
             <div className="bg-white p-8 rounded-xl border border-gray-200 text-left max-w-md mx-auto shadow-sm">
                <div className="space-y-5">
                  <div>
                     <label className="text-xs font-bold text-gray-600 uppercase">Número do Cartão</label>
                     <div className="relative">
                       <CreditCard className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                       <input type="text" placeholder="0000 0000 0000 0000" className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none transition mt-1" />
                     </div>
                  </div>
                  <div>
                     <label className="text-xs font-bold text-gray-600 uppercase">Nome Impresso</label>
                     <input type="text" placeholder="SEU NOME AQUI" className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none transition mt-1" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="text-xs font-bold text-gray-600 uppercase">Validade</label>
                       <input type="text" placeholder="MM/AA" className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none transition mt-1" />
                     </div>
                     <div>
                       <label className="text-xs font-bold text-gray-600 uppercase">CVC</label>
                       <div className="relative">
                          <ShieldCheck className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                          <input type="password" placeholder="123" className="w-full pl-9 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none transition mt-1" />
                       </div>
                     </div>
                  </div>
                </div>
                <button onClick={handleSimulatePayment} className="w-full bg-violet-600 text-white py-3.5 rounded-xl font-bold hover:bg-violet-700 transition flex justify-center items-center gap-2 mt-8">
                   <ShieldCheck className="w-5 h-5" /> Adicionar Cartão (Simulação)
                </button>
                <button onClick={() => setStep('method')} className="w-full text-center text-gray-500 mt-4 text-sm font-medium hover:text-gray-700 block">← Voltar</button>
             </div>
           )}

           {step === 'processing' && (
             <div className="flex flex-col items-center justify-center py-16">
               <Loader2 className="w-16 h-16 text-violet-600 animate-spin mb-6" />
               <h3 className="text-2xl font-bold text-gray-900">Processando com IA...</h3>
               <p className="text-gray-500 mt-2">Falando com a adquirente e liberando o pedido no estoque.</p>
             </div>
           )}

           {step === 'tracking' && (
             <div className="max-w-lg mx-auto bg-white border border-gray-200 p-8 rounded-2xl shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                  <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                    <Truck className="w-5 h-5 text-violet-600" />
                  </div>
                  Rastreamento Agentic em Tempo Real
                </h3>
                
                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-[1px] before:h-full before:w-0.5 before:bg-gray-100">
                   <TrackingStep icon={<CheckCircle2 className="w-4 h-4" />} active={trackingStage >= 0} title="Pagamento Aprovado pelo Banco" desc="Confirmação processada pelo Agente Financeiro." />
                   <TrackingStep icon={<Package className="w-4 h-4" />} active={trackingStage >= 1} title="Separação Concluída no Armazém" desc="Agente de Logística alocou no container 4B." />
                   <TrackingStep icon={<Truck className="w-4 h-4" />} active={trackingStage >= 2} title="A Pedido saiu para Rota de Entrega" desc="Leilão concluído. Transportadora Oficial em trânsito." />
                   <TrackingStep icon={<Bot className="w-4 h-4" />} active={trackingStage >= 3} title="Pacote Entregue com Sucesso" desc="O agente confirma: missão cumprida!" />
                </div>
                
                {trackingStage >= 3 && (
                   <button onClick={onClose} className="w-full mt-10 bg-gray-900 text-white py-3.5 rounded-xl font-bold hover:bg-black transition shadow-lg hover:-translate-y-0.5">
                     Fechar e Voltar à Loja
                   </button>
                )}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

function TrackingStep({ icon, active, title, desc }: { icon: React.ReactNode, active: boolean, title: string, desc: string }) {
  return (
    <div className={`flex items-start gap-4 transition-all duration-700 relative z-10 ${active ? 'opacity-100 translate-x-0' : 'opacity-40 grayscale -translate-x-2'}`}>
       <div className={`flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 ring-4 ring-white ${active ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/40' : 'bg-gray-200 text-gray-400'}`}>
         {icon}
       </div>
       <div className="pt-1">
         <div className="font-bold text-gray-900 text-base">{title}</div>
         <div className="text-sm text-gray-500 mt-0.5 max-w-sm">{desc}</div>
       </div>
    </div>
  );
}
