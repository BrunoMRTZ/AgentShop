import { useState, useEffect } from 'react';
import { products as localProducts, categories } from '../data/products';
import { ProductCard } from './ProductCard';
import { Product } from '../types';
import { Search, Filter, X } from 'lucide-react';
import { apiClient, DBCalibration } from '../services/apiClient';

interface ProductGridProps {
  searchQuery: string;
  activeCalibrations?: DBCalibration[];
  onRemoveCalibration?: (calId: number) => void;
  onViewDetails: (product: Product) => void;
}

export function ProductGrid({ searchQuery, activeCalibrations = [], onRemoveCalibration, onViewDetails }: ProductGridProps) {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'rating' | 'deal'>('default');
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     apiClient.getProducts().then(prods => {
        // Se o banco estiver vazio, carrega os locais estáticos por segurança
        if (!prods || prods.length === 0) {
            setDbProducts(localProducts);
        } else {
            setDbProducts(prods);
        }
        setLoading(false);
     });
  }, [activeCalibrations]); // Recarrega se alterar calibrações

  let filtered = dbProducts.filter(p => {
    const matchCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
    const matchSearch = searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchCalibrations = activeCalibrations.length === 0 || activeCalibrations.some(cal => 
      p.name.toLowerCase().includes(cal.intent.toLowerCase()) ||
      p.description.toLowerCase().includes(cal.intent.toLowerCase()) ||
      p.category.toLowerCase().includes(cal.intent.toLowerCase())
    );

    return matchCategory && matchSearch && matchCalibrations;
  });

  switch (sortBy) {
    case 'price-asc':
      filtered.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      filtered.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      filtered.sort((a, b) => b.rating - a.rating);
      break;
    case 'deal':
      filtered.sort((a, b) => b.agentData.dealScore - a.agentData.dealScore);
      break;
  }

  if (loading) {
    return (
      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 py-32 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600 mb-4"></div>
        <h3 className="text-xl font-semibold text-gray-700">Sincronizando produtos com a IA...</h3>
      </section>
    );
  }

  return (
    <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      {/* Section Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          Produtos com{' '}
          <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Análise IA
          </span>
        </h2>
        <p className="text-gray-500 mt-2 max-w-lg mx-auto">
          Cada produto é analisado por nossos agentes em tempo real para garantir a melhor experiência de compra
        </p>
      </div>

      {/* Active Calibrations Tags */}
      {activeCalibrations.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          <span className="text-sm font-semibold text-gray-500 py-1.5 px-2">Calibrações ativas:</span>
          {activeCalibrations.map(cal => (
            <div key={cal.id} className="bg-violet-100 text-violet-700 text-sm font-bold flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-full shadow-sm border border-violet-200">
              <span className="capitalize">{cal.intent}</span>
              <button 
                onClick={() => onRemoveCalibration && onRemoveCalibration(cal.id)}
                className="w-5 h-5 bg-violet-200 hover:bg-violet-300 text-violet-800 rounded-full flex items-center justify-center transition-colors"
                title="Remover inteligência"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
          >
            <option value="default">Relevância</option>
            <option value="price-asc">Menor preço</option>
            <option value="price-desc">Maior preço</option>
            <option value="rating">Melhor avaliação</option>
            <option value="deal">Melhor oferta</option>
          </select>
        </div>
      </div>

      {/* Products */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">Nenhum produto encontrado</h3>
          <p className="text-gray-400 mt-1">Tente ajustar seus filtros ou pergunte ao agente</p>
        </div>
      )}
    </section>
  );
}
