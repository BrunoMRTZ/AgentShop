import { useState } from 'react';
import { X, Star, TrendingUp, TrendingDown, Minus, ShoppingCart, Brain, BarChart3, Shield, Clock, ListOrdered } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { products as allProducts } from '../data/products';

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
}

export function ProductDetail({ product, onClose }: ProductDetailProps) {
  const { addToCart } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState<number>(product.id);
  
  const similarItems = allProducts
     .filter(p => product.agentData.similarProducts?.includes(p.id))
     .sort((a, b) => b.agentData.dealScore - a.agentData.dealScore) // Highest score first
     .slice(0, 3); // Max 3 alternatives
     
  const activeProduct = selectedVariantId === product.id ? product : (allProducts.find(p => p.id === selectedVariantId) || product);

  const discount = activeProduct.originalPrice
    ? Math.round(((activeProduct.originalPrice - activeProduct.price) / activeProduct.originalPrice) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Image */}
          <div className="bg-gray-50 flex items-center justify-center p-8 md:p-12 rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none min-h-[300px]">
             {product.image.startsWith('http') ? (
                <img src={product.image} alt={product.name} className="w-full max-h-[350px] object-contain mix-blend-multiply drop-shadow-md" />
             ) : (
                <span className="text-9xl">{product.image}</span>
             )}
          </div>

          {/* Info */}
          <div className="p-6 space-y-5">
            <span className="text-xs font-semibold text-violet-600 bg-violet-50 px-3 py-1 rounded-md uppercase tracking-wider">
              {product.category}
            </span>

            <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {product.rating} ({product.reviews.toLocaleString()} avaliações)
              </span>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>

            {/* Price */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-1">
              {activeProduct.originalPrice && (
                <span className="text-sm text-gray-400 line-through">
                  R$ {activeProduct.originalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              )}
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">
                  R$ {activeProduct.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                {discount > 0 && (
                  <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-0.5 rounded-md">
                    -{discount}%
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500">
                12x de R$ {(activeProduct.price / 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} sem juros
              </span>
            </div>

            {/* Agent Analysis */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-violet-600" />
                <span className="text-sm font-semibold text-gray-900">Análise do Agente IA</span>
              </div>

              <div className="bg-violet-50/50 rounded-xl p-4 space-y-3">
                {/* Deal Score Bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Score de Oferta</span>
                    <span className="font-bold text-violet-700">{product.agentData.dealScore}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all"
                      style={{ width: `${product.agentData.dealScore}%` }}
                    />
                  </div>
                </div>

                {/* Personalization */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Compatibilidade com seu perfil</span>
                    <span className="font-bold text-emerald-700">{product.agentData.personalizationScore}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all"
                      style={{ width: `${product.agentData.personalizationScore}%` }}
                    />
                  </div>
                </div>

                {/* Trend */}
                <div className="flex items-center gap-2 text-xs">
                  {product.agentData.priceTrend === 'up' && (
                    <TrendingUp className="w-4 h-4 text-red-500" />
                  )}
                  {product.agentData.priceTrend === 'down' && (
                    <TrendingDown className="w-4 h-4 text-emerald-500" />
                  )}
                  {product.agentData.priceTrend === 'stable' && (
                    <Minus className="w-4 h-4 text-gray-400" />
                  )}
                  <span className={`font-medium ${
                    product.agentData.priceTrend === 'up' ? 'text-red-600' :
                    product.agentData.priceTrend === 'down' ? 'text-emerald-600' : 'text-gray-500'
                  }`}>
                    {product.agentData.priceTrend === 'up' && 'Tendência de alta — compre agora!'}
                    {product.agentData.priceTrend === 'down' && 'Tendência de queda — pode esperar.'}
                    {product.agentData.priceTrend === 'stable' && 'Preço estável — bom momento.'}
                  </span>
                </div>

                {/* AI Summary */}
                <div className="flex items-start gap-2 text-xs text-gray-600 bg-white/60 rounded-lg p-2.5">
                  <BarChart3 className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5" />
                  <span>{product.agentData.aiSummary}</span>
                </div>
              </div>

              {/* Ranking Override Options */}
              {similarItems.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <ListOrdered className="w-4 h-4 text-violet-600" />
                    <span className="text-sm font-bold text-gray-900">Ranking do Agente (Top Alternativas)</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">Discorda da principal sugestão? Selecione outra equivalente no ranking da malha IA.</p>
                  
                  <div className="space-y-2">
                     <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedVariantId === product.id ? 'border-violet-500 bg-violet-50/50 shadow-sm' : 'border-gray-200 hover:border-violet-300'}`}>
                       <input type="radio" name="variant" checked={selectedVariantId === product.id} onChange={() => setSelectedVariantId(product.id)} className="mt-1 accent-violet-600 w-4 h-4 shrink-0" />
                       <div className="flex-1 w-full overflow-hidden">
                         <div className="flex justify-between items-center gap-2">
                           <span className="font-bold text-sm text-gray-900 truncate">Sugestão Principal (Ideal)</span>
                           <span className="bg-violet-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0">1º LUGAR</span>
                         </div>
                         <p className="text-xs text-gray-500 mt-1 truncate">R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} • Score {product.agentData.dealScore}</p>
                       </div>
                     </label>
                     
                     {similarItems.map((item, index) => (
                       <label key={item.id} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedVariantId === item.id ? 'border-violet-500 bg-violet-50/50 shadow-sm' : 'border-gray-200 hover:border-violet-300'}`}>
                         <input type="radio" name="variant" checked={selectedVariantId === item.id} onChange={() => setSelectedVariantId(item.id)} className="mt-1 accent-violet-600 w-4 h-4 shrink-0" />
                         <div className="flex-1 w-full overflow-hidden">
                           <div className="flex justify-between items-center gap-2">
                             <span className={`font-semibold text-sm truncate ${selectedVariantId === item.id ? 'text-gray-900' : 'text-gray-700'}`}>{item.name}</span>
                             <span className="bg-gray-200 text-gray-600 text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0">{index + 2}º LUGAR</span>
                           </div>
                           <p className="text-xs text-gray-500 mt-1 truncate">R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} • Score {item.agentData.dealScore}</p>
                         </div>
                       </label>
                     ))}
                  </div>
                </div>
              )}
            </div>

            {/* Agent Badges */}
            <div className="flex flex-wrap gap-2">
              <span className="flex items-center gap-1 text-[11px] bg-blue-50 text-blue-600 px-2 py-1 rounded-lg font-medium">
                <Shield className="w-3 h-3" /> Compra protegida
              </span>
              <span className="flex items-center gap-1 text-[11px] bg-amber-50 text-amber-600 px-2 py-1 rounded-lg font-medium">
                <Clock className="w-3 h-3" /> Entrega em 24h
              </span>
            </div>

            {/* CTA */}
            <button
              onClick={() => {
                addToCart(activeProduct);
                onClose();
              }}
              className={`w-full flex items-center justify-center gap-2 text-white py-3.5 rounded-xl font-semibold transition-all active:scale-[0.98] ${selectedVariantId === product.id ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:shadow-xl hover:shadow-violet-500/25' : 'bg-gray-900 hover:bg-black hover:shadow-xl hover:shadow-gray-900/25'}`}
            >
              <ShoppingCart className="w-5 h-5" />
              {selectedVariantId === product.id ? 'Adicionar ao Carrinho' : 'Optar pela Alternativa Ranqueada'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
