import { useState } from 'react';
import { User, Package, TrendingUp, Shield, LogOut, CheckCircle2, Truck, Bot, ArrowRight, Wallet } from 'lucide-react';

interface UserDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onCalibrate: () => void;
}

export function UserDashboard({ isOpen, onClose, onCalibrate }: UserDashboardProps) {
  const [isLogged, setIsLogged] = useState(false);
  const [activeTab, setActiveTab] = useState<'visao_geral' | 'pedidos'>('visao_geral');
  const [loginStep, setLoginStep] = useState(0);

  if (!isOpen) return null;

  const handleSimulatedAuth = () => {
    setLoginStep(1); // scanning
    setTimeout(() => {
      setLoginStep(2); // success
      setTimeout(() => setIsLogged(true), 1500);
    }, 2000);
  };

  const closeAndLogout = () => {
    setIsLogged(false);
    setLoginStep(0);
    onClose();
  };

  if (!isLogged) {
    return (
      <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-md bg-white shadow-xl rounded-2xl p-8 text-center animate-slide-in">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
             <User className="w-8 h-8 text-white -rotate-3" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Minha Conta</h2>
          <p className="text-gray-500 text-sm mb-8">Acesse seu painel com inteligência artificial</p>
          
          {loginStep === 0 && (
            <div className="space-y-4">
              <input type="email" placeholder="E-mail" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none" defaultValue="cliente@demo.com" />
              <input type="password" placeholder="Senha" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none" defaultValue="********" />
              <button 
                onClick={(e) => { e.preventDefault(); setIsLogged(true); }} 
                className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl hover:bg-black transition shadow-lg shrink-0">
                Entrar
              </button>
              
              <div className="relative flex items-center py-4">
                 <div className="flex-grow border-t border-gray-200"></div>
                 <span className="flex-shrink-0 mx-4 text-gray-400 text-[10px] uppercase font-bold tracking-widest">Ou rápido e seguro</span>
                 <div className="flex-grow border-t border-gray-200"></div>
              </div>
              
              <button onClick={handleSimulatedAuth} className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold py-3.5 rounded-xl hover:shadow-violet-500/30 transition shadow-lg flex justify-center items-center gap-2">
                 <Bot className="w-5 h-5" /> Login Automático com Agente
              </button>
            </div>
          )}

          {loginStep === 1 && (
            <div className="py-12 flex flex-col items-center justify-center animate-pulse">
               <Bot className="w-12 h-12 text-violet-600 mb-4" />
               <p className="font-bold text-gray-800 text-lg">Reconhecendo biometria...</p>
               <p className="text-sm text-gray-500 mt-1">Via agente local e seguro</p>
            </div>
          )}

          {loginStep === 2 && (
            <div className="py-12 flex flex-col items-center justify-center">
               <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-4 animate-bounce" />
               <p className="font-bold text-gray-800 text-lg">Identidade confirmada!</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-8">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl h-[85vh] bg-gray-50 shadow-2xl rounded-2xl flex flex-col md:flex-row overflow-hidden animate-slide-in">
         {/* Sidebar */}
         <div className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">AL</div>
                 <div>
                   <h3 className="font-bold text-gray-900 text-sm leading-tight">Alex Silva</h3>
                   <span className="text-[10px] bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Cliente Agentic</span>
                 </div>
               </div>
               <button onClick={onClose} className="md:hidden text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
            </div>
            
            <nav className="flex-1 p-4 flex md:flex-col gap-2 overflow-x-auto custom-scrollbar">
               <button onClick={() => setActiveTab('visao_geral')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition whitespace-nowrap shrink-0 ${activeTab === 'visao_geral' ? 'bg-violet-50 text-violet-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                 <Bot className="w-5 h-5" /> <span>Dashboard IA</span>
               </button>
               <button onClick={() => setActiveTab('pedidos')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition whitespace-nowrap shrink-0 ${activeTab === 'pedidos' ? 'bg-violet-50 text-violet-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                 <Package className="w-5 h-5" /> <span>Meus Pedidos</span>
               </button>
               <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition whitespace-nowrap shrink-0">
                 <User className="w-5 h-5" /> <span>Perfil e Conta</span>
               </button>
            </nav>

            <div className="p-4 border-t border-gray-100">
               <button onClick={closeAndLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition w-full">
                 <LogOut className="w-5 h-5" /> <span>Encerrar Sessão</span>
               </button>
            </div>
         </div>

         {/* Painel Principal */}
         <div className="flex-1 overflow-y-auto p-5 sm:p-8 bg-gray-50/50">
            {activeTab === 'visao_geral' && (
              <div className="space-y-6 max-w-3xl">
                <div className="flex items-center justify-between">
                   <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Olá, Alex 👋</h2>
                   <button onClick={onClose} className="hidden md:flex w-8 h-8 bg-white border border-gray-200 rounded-full items-center justify-center text-gray-500 hover:bg-gray-100 text-xl leading-none shadow-sm">&times;</button>
                </div>
                
                {/* Agent Stats */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-4 hover:shadow-md transition">
                     <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                       <TrendingUp className="w-5 h-5" />
                     </div>
                     <div>
                       <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Economia com IA</p>
                       <h3 className="text-2xl font-black text-gray-900 mt-1">R$ 485,90</h3>
                       <p className="text-[11px] text-emerald-600 font-bold mt-1 bg-emerald-50 inline-block px-1.5 py-0.5 rounded">Este ano</p>
                     </div>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-4 hover:shadow-md transition">
                     <div className="w-10 h-10 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center shrink-0">
                       <Shield className="w-5 h-5" />
                     </div>
                     <div>
                       <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Score IA</p>
                       <h3 className="text-2xl font-black text-gray-900 mt-1">92/100</h3>
                       <p className="text-[11px] text-violet-600 font-bold mt-1 bg-violet-50 inline-block px-1.5 py-0.5 rounded">Acesso VIP a ofertas</p>
                     </div>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-4 hover:shadow-md transition">
                     <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                       <Wallet className="w-5 h-5" />
                     </div>
                     <div>
                       <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Cashback</p>
                       <h3 className="text-2xl font-black text-gray-900 mt-1">R$ 54,20</h3>
                       <p className="text-[11px] text-blue-600 font-bold mt-1 bg-blue-50 inline-block px-1.5 py-0.5 rounded">Para próxima compra</p>
                     </div>
                  </div>
                </div>

                {/* Agent Message insight */}
                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white flex flex-col sm:flex-row gap-5 items-start sm:items-center shadow-lg relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
                   <Bot className="w-10 h-10 shrink-0 bg-white/20 p-2 rounded-xl" />
                   <div className="relative z-10 flex-1">
                     <h4 className="font-bold text-lg">O seu perfil está calibrado!</h4>
                     <p className="text-sm mt-1 opacity-90 w-full">As análises da web garantem ofertas com 95% de compatibilidade para seu interesse.</p>
                   </div>
                   <div className="sm:ml-auto flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0 relative z-10 border-t sm:border-t-0 border-white/10 pt-4 sm:pt-0 mt-2 sm:mt-0">
                     <button onClick={onCalibrate} className="w-full sm:w-auto bg-white/20 text-white border border-white/30 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-white/30 transition-colors shadow-sm">
                       Recalibrar Perfil
                     </button>
                     <button onClick={onClose} className="w-full sm:w-auto bg-white text-violet-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:scale-105 transition-transform shadow-sm">
                       Filtrar Produtos
                     </button>
                   </div>
                </div>
                
                {/* Atividade Recente */}
                <div>
                   <h3 className="text-lg font-bold text-gray-900 mb-4 px-1">Atividade Recente</h3>
                   <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden divide-y divide-gray-100 shadow-sm">
                     <div className="p-5 flex items-center gap-4 hover:bg-gray-50 transition cursor-default">
                       <div className="bg-gray-100 p-3 rounded-xl"><Truck className="w-5 h-5 text-gray-600" /></div>
                       <div className="flex-1">
                         <h4 className="font-bold text-sm text-gray-900">Seu pacote (Pedido #88392) saiu para entrega</h4>
                         <p className="text-xs text-gray-500 mt-0.5">O agente acompanhou todo o faturamento ontem.</p>
                       </div>
                       <span className="text-xs font-medium text-gray-400 hidden sm:block">Hoje, 09:41</span>
                     </div>
                     <div className="p-5 flex items-center gap-4 hover:bg-gray-50 transition cursor-default">
                       <div className="bg-violet-100 p-3 rounded-xl"><Bot className="w-5 h-5 text-violet-600" /></div>
                       <div className="flex-1">
                         <h4 className="font-bold text-sm text-gray-900">Agente evitou um aumento de preço!</h4>
                         <p className="text-xs text-gray-500 mt-0.5">Garantimos um cupom em um item do seu carrinho.</p>
                       </div>
                       <span className="text-xs font-medium text-gray-400 hidden sm:block">Ontem</span>
                     </div>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'pedidos' && (
              <div className="space-y-6 max-w-3xl">
                <div className="flex items-center justify-between">
                   <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Histórico de Compras</h2>
                   <button onClick={onClose} className="hidden md:flex w-8 h-8 bg-white border border-gray-200 rounded-full items-center justify-center text-gray-500 hover:bg-gray-100 text-xl shadow-sm">&times;</button>
                </div>
                
                {/* Orders List */}
                <div className="space-y-4">
                   <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:border-violet-300 transition">
                      <div className="flex flex-wrap justify-between items-start gap-4 mb-5">
                        <div>
                          <div className="text-[10px] font-bold text-violet-700 bg-violet-100 px-2 py-1 rounded inline-block mb-2 uppercase tracking-wide">Comprado com Agente</div>
                          <h3 className="font-black text-gray-900 text-lg">Pedido #10294</h3>
                          <p className="text-sm text-gray-500 mt-0.5">Realizado 15 de Outubro de 2026</p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="font-black text-gray-900 text-xl">R$ 2.499,90</p>
                          <p className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded inline-block mt-1">Pago via PIX Inteligente</p>
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-100 pt-5 flex gap-4 items-center">
                         <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center text-3xl border border-gray-100">🖥️</div>
                         <div>
                           <p className="font-bold text-gray-900 text-sm md:text-base">Monitor Gamer 27" 165Hz</p>
                           <p className="text-xs font-medium text-gray-500 mt-1 flex gap-1 items-center">Status: <span className="text-blue-600 font-bold bg-blue-50 px-1 py-0.5 rounded">Em trânsito nacional</span></p>
                         </div>
                         <button className="ml-auto min-w-[120px] flex justify-center items-center gap-1.5 text-sm bg-gray-900 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-black transition hover:-translate-y-0.5 shadow-md">
                            Rastrear <ArrowRight className="w-4 h-4" />
                         </button>
                      </div>
                   </div>

                   <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm opacity-80 hover:opacity-100 transition">
                      <div className="flex flex-wrap justify-between items-start gap-4 mb-5">
                        <div>
                          <h3 className="font-black text-gray-900 text-lg">Pedido #88392</h3>
                          <p className="text-sm text-gray-500 mt-0.5">Realizado 3 de Agosto de 2026</p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="font-black text-gray-900 text-xl">R$ 549,90</p>
                          <p className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded inline-block mt-1">Cartão final 4432</p>
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-100 pt-5 flex gap-4 items-center">
                         <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center text-3xl border border-gray-100">🎧</div>
                         <div>
                           <p className="font-bold text-gray-900 text-sm md:text-base">Fone Bluetooth Pro Max</p>
                           <p className="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Entregue</p>
                         </div>
                         <button className="ml-auto text-sm text-violet-600 font-bold hover:underline">
                            Comprar Novamente
                         </button>
                      </div>
                   </div>
                </div>
              </div>
            )}
         </div>
      </div>
    </div>
  );
}
