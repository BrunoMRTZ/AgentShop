import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ShoppingCart, Sparkles, Tag, Gift, Truck, MapPin, Loader2, CheckCircle2 } from 'lucide-react';

interface SmartCartProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export function SmartCart({ isOpen, onClose, onCheckout }: SmartCartProps) {
  const { items, removeFromCart, updateQuantity, clearCart, totalPrice, totalSavings } = useCart();
  const [cep, setCep] = useState('');
  const [auctionStatus, setAuctionStatus] = useState<'idle' | 'bidding' | 'done'>('idle');
  const [bids, setBids] = useState<{id: string, carrier: string, price: number, days: number, isCorreios?: boolean}[]>([]);
  const [selectedBidId, setSelectedBidId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setAuctionStatus('idle');
      setCep('');
      setBids([]);
      setSelectedBidId(null);
    }
  }, [isOpen]);

  const simulateAuction = () => {
    if (cep.length < 8) return;
    setAuctionStatus('bidding');
    setBids([]);
    
    setTimeout(() => {
      setBids([{ id: 'c1', carrier: 'Correios PAC', price: 23.50, days: 7, isCorreios: true }]);
    }, 800);

    setTimeout(() => {
      setBids(prev => [...prev, { id: 'j1', carrier: 'Jadlog Express', price: 25.90, days: 5 }]);
    }, 1600);

    setTimeout(() => {
      setBids(prev => {
        const newBids = [...prev, { id: 'c2', carrier: 'Correios SEDEX', price: 42.00, days: 2, isCorreios: true }];
        return newBids.sort((a, b) => a.price - b.price);
      });
    }, 2400);

    setTimeout(() => {
      setBids(prev => {
        // O Agente negocia um frete embutido mais barato
        const newBids = [...prev, { id: 'a1', carrier: 'Agentic Logistics', price: 18.90, days: 4 }];
        const sorted = newBids.sort((a, b) => a.price - b.price);
        setSelectedBidId(sorted[0].id);
        setAuctionStatus('done');
        return sorted;
      });
    }, 3500);
  };

  if (!isOpen) return null;

  const agentSavings = totalPrice * 0.05; // Simulated agent additional discount
  const freeShipping = totalPrice >= 299;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-5 h-5 text-violet-600" />
            <h2 className="text-lg font-bold text-gray-900">Carrinho Inteligente</h2>
            <span className="bg-violet-100 text-violet-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {items.length} {items.length === 1 ? 'item' : 'itens'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
          >
            ×
          </button>
        </div>

        {/* Agent Insights */}
        {items.length > 0 && (
          <div className="mx-6 mt-4 bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl p-4 space-y-2 border border-violet-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-600" />
              <span className="text-sm font-semibold text-violet-800">Otimização do Agente</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/70 rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-emerald-600">
                  -R$ {totalSavings.toFixed(2)}
                </div>
                <div className="text-[10px] text-gray-500">Descontos aplicados</div>
              </div>
              <div className="bg-white/70 rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-violet-600">
                  -R$ {agentSavings.toFixed(2)}
                </div>
                <div className="text-[10px] text-gray-500">Desconto extra do agente</div>
              </div>
            </div>
            {freeShipping && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                <Gift className="w-3.5 h-3.5" />
                <span>Frete grátis ativado pelo agente!</span>
              </div>
            )}
            {!freeShipping && (
              <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                <Tag className="w-3.5 h-3.5" />
                <span>Faltam R$ {(299 - totalPrice).toFixed(2)} para frete grátis</span>
              </div>
            )}
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingCart className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400">Seu carrinho está vazio</p>
              <p className="text-sm text-gray-300 mt-1">Adicione produtos para ver a mágica do agente</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.product.id} className="flex gap-3 bg-gray-50 rounded-xl p-3 group">
                <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {item.product.image && item.product.image.startsWith('http') ? (
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover rounded-lg"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <span className="text-3xl">{item.product.image}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">{item.product.name}</h4>
                  <span className="text-xs text-violet-500 font-medium">
                    Score: {item.product.agentData.dealScore}/100
                  </span>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 border border-gray-200"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 border border-gray-200"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      R$ {(item.product.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors self-start"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-4 space-y-3">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>R$ {totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Descontos do agente</span>
                <span>-R$ {(totalSavings + agentSavings).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              {/* Leilão de Frete UI */}
              <div className="pt-3 pb-2 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-3 text-gray-800 font-bold text-sm">
                  <Truck className="w-4 h-4 text-violet-600" />
                  <span>Leilão de Fretes com IA</span>
                </div>
                
                {auctionStatus === 'idle' && (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Insira seu CEP" 
                        value={cep}
                        onChange={e => setCep(e.target.value.replace(/\D/g, '').slice(0, 8))}
                        maxLength={8}
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
                      />
                    </div>
                    <button 
                      onClick={simulateAuction}
                      disabled={cep.length < 8}
                      className="px-4 bg-violet-100 text-violet-700 rounded-lg hover:bg-violet-200 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Leiloar
                    </button>
                  </div>
                )}

                {auctionStatus === 'bidding' && (
                  <div className="bg-violet-50 rounded-lg p-3 border border-violet-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-violet-200">
                       <div className="h-full bg-violet-600 animate-[pulse_1s_ease-in-out_infinite] w-full" style={{ animationDuration: '0.8s' }}></div>
                    </div>
                    <div className="flex items-center gap-2 mb-3 mt-1">
                      <Loader2 className="w-4 h-4 text-violet-600 animate-spin" />
                      <span className="text-xs text-violet-800 font-medium animate-pulse">Agente negociando com Correios e mais...</span>
                    </div>
                    <div className="space-y-2">
                      {bids.map(bid => (
                        <div key={bid.id} className="flex justify-between text-xs items-center bg-white p-2 rounded shadow-sm opacity-90 border border-gray-100">
                          <span className="font-medium text-gray-700 flex items-center gap-1.5">
                            {bid.carrier}
                            {bid.isCorreios && <span className="bg-yellow-100 text-yellow-800 text-[9px] px-1.5 py-0.5 rounded font-bold">Oficial</span>}
                          </span>
                          <span className="text-emerald-600 font-semibold">R$ {bid.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {auctionStatus === 'done' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-2 py-1.5 rounded-lg border border-emerald-100">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="font-medium">Melhor modalidade encontrada!</span>
                      <button onClick={() => setAuctionStatus('idle')} className="ml-auto text-emerald-700 underline opacity-80 hover:opacity-100">Atualizar CEP</button>
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                      {bids.map(bid => (
                        <div 
                          key={bid.id} 
                          onClick={() => setSelectedBidId(bid.id)}
                          className={`flex justify-between text-xs items-center p-2.5 rounded-lg cursor-pointer transition-all border ${selectedBidId === bid.id ? 'border-violet-500 bg-violet-50 shadow-sm' : 'border-gray-200 bg-white hover:border-violet-300'}`}
                        >
                           <div className="flex items-center gap-3">
                              <div className={`w-3.5 h-3.5 rounded-full border flex flex-shrink-0 ${selectedBidId === bid.id ? 'border-[4px] border-violet-600 bg-white' : 'border-gray-300'}`} />
                              <div className="flex flex-col">
                                <span className="font-bold text-gray-800 flex items-center gap-1.5">
                                  {bid.carrier} 
                                  {bid.isCorreios && <span className="bg-[#FFE600] text-[#00315A] text-[9px] px-1.5 py-0.5 rounded font-bold">Correios</span>}
                                </span>
                                <span className="text-[10px] text-gray-500 mt-0.5">Entrega em {bid.days} dias úteis</span>
                              </div>
                           </div>
                           <div className="text-right">
                             {freeShipping ? (
                                <div className="font-bold text-emerald-600">Grátis</div>
                             ) : (
                                <div className="font-bold text-gray-900">R$ {bid.price.toFixed(2)}</div>
                             )}
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-100 mt-2">
                <span>Total</span>
                <span>
                  R$ {(totalPrice - agentSavings + (freeShipping ? 0 : (selectedBidId !== null ? (bids.find(b => b.id === selectedBidId)?.price || 0) : 0))).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <button 
              onClick={onCheckout}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:shadow-xl hover:shadow-violet-500/25 transition-all active:scale-[0.98]">
              Finalizar Compra com IA
            </button>

            <button
              onClick={clearCart}
              className="w-full text-xs text-gray-400 hover:text-red-500 transition-colors py-1"
            >
              Limpar carrinho
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
