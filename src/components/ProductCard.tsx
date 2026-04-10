import { Star, TrendingUp, TrendingDown, Minus, ShoppingCart, AlertTriangle, CheckCircle } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
}

export function ProductCard({ product, onViewDetails }: ProductCardProps) {
  const { addToCart } = useCart();
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const getDealScoreColor = (score: number) => {
    if (score >= 90) return 'from-emerald-500 to-green-500';
    if (score >= 80) return 'from-blue-500 to-cyan-500';
    if (score >= 70) return 'from-amber-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const getStockBadge = (level: string) => {
    if (level === 'low') return { label: 'Últimas unidades!', color: 'bg-red-100 text-red-700' };
    if (level === 'medium') return { label: 'Estoque médio', color: 'bg-amber-100 text-amber-700' };
    return { label: 'Em estoque', color: 'bg-emerald-100 text-emerald-700' };
  };

  const stockBadge = getStockBadge(product.agentData.stockLevel);

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-violet-500/5 transition-all hover:-translate-y-1">
      {/* Agent Badge */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {discount > 0 && (
          <span className="bg-red-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-lg">
            -{discount}%
          </span>
        )}
        {product.agentData.stockLevel === 'low' && (
          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 animate-pulse">
            <AlertTriangle className="w-3 h-3" />
            Estoque baixo
          </span>
        )}
      </div>

      {/* Deal Score */}
      <div className="absolute top-3 right-3 z-10">
        <div className={`bg-gradient-to-br ${getDealScoreColor(product.agentData.dealScore)} text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg shadow-lg text-center`}>
          <div className="text-[9px] opacity-80">OFERTA</div>
          <div className="text-sm leading-none">{product.agentData.dealScore}</div>
        </div>
      </div>

      {/* Image */}
      <div
        className="relative h-48 bg-gray-50 flex items-center justify-center cursor-pointer p-4 overflow-hidden"
        onClick={() => onViewDetails(product)}
      >
        {product.image.startsWith('http') ? (
           <img src={product.image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500 ease-out" />
        ) : (
           <span className="text-7xl group-hover:scale-110 transition-transform duration-300">
             {product.image}
           </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Category */}
        <span className="text-[11px] font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
          {product.category}
        </span>

        {/* Name */}
        <h3
          className="font-bold text-gray-900 leading-snug cursor-pointer hover:text-violet-600 transition-colors line-clamp-2"
          onClick={() => onViewDetails(product)}
        >
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">
            {product.rating} ({product.reviews.toLocaleString()})
          </span>
        </div>

        {/* Price */}
        <div className="space-y-0.5">
          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through">
              R$ {product.originalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          )}
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900">
              R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            {discount > 0 && (
              <span className="text-xs font-semibold text-emerald-600">
                Economia R$ {((product.originalPrice || 0) - product.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            )}
          </div>
          <span className="text-[11px] text-gray-400">
            ou 12x de R$ {(product.price / 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} sem juros
          </span>
        </div>

        {/* Price Trend */}
        <div className="flex items-center gap-1.5 text-xs">
          {product.agentData.priceTrend === 'up' && (
            <span className="flex items-center gap-1 text-red-500">
              <TrendingUp className="w-3.5 h-3.5" /> Preço subindo
            </span>
          )}
          {product.agentData.priceTrend === 'down' && (
            <span className="flex items-center gap-1 text-emerald-500">
              <TrendingDown className="w-3.5 h-3.5" /> Preço caindo
            </span>
          )}
          {product.agentData.priceTrend === 'stable' && (
            <span className="flex items-center gap-1 text-gray-400">
              <Minus className="w-3.5 h-3.5" /> Preço estável
            </span>
          )}
        </div>

        {/* Stock Badge */}
        <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-md ${stockBadge.color}`}>
          {stockBadge.label}
        </span>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => addToCart(product)}
            className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition-all active:scale-95"
          >
            <ShoppingCart className="w-4 h-4" />
            Comprar
          </button>
          <button
            onClick={() => onViewDetails(product)}
            className="px-3 py-2.5 bg-gray-50 rounded-xl text-gray-600 hover:bg-gray-100 transition-all"
          >
            <CheckCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
