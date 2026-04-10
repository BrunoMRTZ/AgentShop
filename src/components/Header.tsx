import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ShoppingCart, Bot, Search, User, Loader2, Sparkles, Globe, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAgent } from '../context/AgentContext';
import { products } from '../data/products';
import { apiClient } from '../services/apiClient';

interface HeaderProps {
  onCartClick: () => void;
  onSearch: (query: string) => void;
  onUserClick: () => void;
}

export function Header({ onCartClick, onSearch, onUserClick }: HeaderProps) {
  const { totalItems } = useCart();
  const { setChatOpen, chatOpen } = useAgent();
  const [liveQuery, setLiveQuery] = useState('');
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [showAiPopup, setShowAiPopup] = useState(false);
  const [showIframe, setShowIframe] = useState(false);

  useEffect(() => {
    if (liveQuery.trim().length > 2) {
      setShowAiPopup(true);
      setIsAiSearching(true);
      const timer = setTimeout(() => {
        setIsAiSearching(false);
      }, 1000); // Simulando delay do LLM
      return () => clearTimeout(timer);
    } else {
      setShowAiPopup(false);
    }
  }, [liveQuery]);

  const handleCommitSearch = () => {
    onSearch(liveQuery);
    setShowAiPopup(false);
    setTimeout(() => {
      document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const getAiOverview = (q: string) => {
    const qt = q.toLowerCase();
    if (qt.includes('iphone 15') || qt.includes('titânio') || qt.includes('pro max') || qt.includes('apple')) {
      return {
        text: (
          <span>
            De acordo com as consolidações do principal buscador, o <strong>Apple iPhone 15 Pro Max (256 GB) - Titânio Natural</strong> é o primeiro iPhone com design forjado em titânio aeroespacial (liga usada em naves espaciais), tornando-o o modelo Pro mais leve de todos. Destaca-se pelo seu <strong>Chip A17 Pro</strong> capaz de rodar games de console de última geração de forma nativa e um super sistema de câmera 48 MP com aproximação via <strong>Zoom Óptico de 5x</strong>. Completando com sua porta USB-C em padrão USB 3 capaz de transmitir vídeos diretos.
          </span>
        ),
        tags: ["Design em Titânio", "Chip A17 Pro", "Câmera 48MP Zoom 5x", "Bateria +24h", "Nova Porta USB-C"]
      };
    }

    return {
      text: (
        <span>
          Com base nas tendências do Mercado Livre e rastreios web profundos de hoje, as listagens de <strong>"{q}"</strong> destacam-se por excelente relação de vendas, entregas full e ótimas proteções de garantia contra defeitos de fábrica.
        </span>
      ),
      tags: ["Recomendação Favorita", "Alta Durabilidade", "Melhor Avaliado"]
    };
  };

  const aiData = getAiOverview(liveQuery);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top bar */}
        <div className="flex items-center justify-between py-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                AgentShop
              </h1>
              <p className="text-[10px] text-gray-400 -mt-1 font-medium tracking-wider uppercase">
                Agentic Retail
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8 relative">
            <div className={`relative w-full z-50 transition-all ${showAiPopup ? 'ring-2 ring-violet-500 rounded-xl bg-white shadow-sm' : ''}`}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={liveQuery}
                onKeyDown={(e) => e.key === 'Enter' && handleCommitSearch()}
                placeholder="Pesquisa Agentic: 'Quero um fone noise-cancelling barato'..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl text-sm focus:outline-none focus:bg-white transition-all text-gray-800"
                onChange={(e) => setLiveQuery(e.target.value)}
                onFocus={() => liveQuery.trim().length > 2 && setShowAiPopup(true)}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 items-center">
                <button
                  onClick={() => setShowIframe(true)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-violet-600 px-2 py-1 rounded-md transition-colors mr-1 cursor-pointer"
                  title="Abrir pesquisa extrema (Iframe Google)"
                >
                  <Globe className="w-3.5 h-3.5" />
                </button>
                <div className="flex gap-1 items-center bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">IA</span>
                </div>
              </div>
            </div>

            {/* AI Popup Overlay */}
            {showAiPopup && (
              <div className="absolute top-12 mt-1 w-full bg-white rounded-2xl shadow-2xl border border-violet-100 overflow-hidden z-50 animate-fade-in">
                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 flex items-center gap-2 text-white">
                  <Bot className="w-4 h-4 text-white" />
                  <span className="text-xs font-bold uppercase tracking-wider">Visão Geral por IA</span>
                </div>

                <div className="p-5">
                  {isAiSearching ? (
                    <div className="space-y-4">
                      <div className="flex gap-2 items-center text-sm text-gray-500 mb-2">
                        <Loader2 className="w-4 h-4 animate-spin text-violet-600" /> Cruzando resultados da web para "{liveQuery}"...
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 bg-gray-100 rounded-full w-full animate-pulse"></div>
                        <div className="h-2 bg-gray-100 rounded-full w-5/6 animate-pulse"></div>
                        <div className="h-2 bg-gray-100 rounded-full w-4/6 animate-pulse"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-fade-in">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {aiData.text}
                      </p>

                      <div className="flex gap-2 flex-wrap pt-1">
                        {aiData.tags.map((tag, i) => (
                          <span key={i} className={`text-[11px] px-2 py-1 rounded-md font-medium ${i === 0 ? 'bg-violet-50 border border-violet-100 text-violet-700' : 'bg-gray-50 border border-gray-100 text-gray-600'}`}>
                            {tag}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={handleCommitSearch}
                        className="w-full flex justify-center items-center gap-2 bg-gray-900 text-white hover:bg-black py-3 rounded-xl text-sm font-bold transition-colors mt-3"
                      >
                        <Search className="w-4 h-4" />
                        Mostrar resultados no painel de compras
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Backdrop invisible for closing */}
            {showAiPopup && (
              <div
                className="fixed inset-0 z-40 bg-transparent"
                onClick={() => setShowAiPopup(false)}
                style={{ height: '100vh', width: '100vw', top: 0, left: 0 }}
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onUserClick}
              className="relative flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200 hover:shadow-sm"
            >
              <User className="w-4 h-4" />
              <span className="hidden md:inline">Minha Conta</span>
            </button>

            <button
              onClick={() => setChatOpen(!chatOpen)}
              className={`relative flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${chatOpen
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30 font-bold'
                  : 'bg-violet-50 text-violet-700 hover:bg-violet-100 font-bold'
                }`}
            >
              <Bot className="w-4 h-4" />
              <span className="hidden md:inline">Assistente</span>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
            </button>

            <button
              onClick={onCartClick}
              className="relative flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-bold bg-gray-900 text-white hover:bg-black transition-all shadow-md hover:shadow-lg"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden md:inline">Carrinho</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 w-[22px] h-[22px] bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-black animate-bounce shadow-sm ring-2 ring-white">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Agent Status Bar */}
      <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-1.5 flex items-center justify-center gap-6 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span>Agente ativo — monitorando 8 produtos</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <span>📊</span>
            <span>3 alertas de preço configurados</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5">
            <span>🔥</span>
            <span>2 ofertas relâmpago ativas</span>
          </div>
          {/* Admin Sync Button */}
          <div 
            className="hidden md:flex items-center gap-1.5 cursor-pointer hover:bg-white/20 px-3 py-0.5 rounded-full border border-white/20 transition-colors ml-4"
            title="Popular banco com dados estáticos"
            onClick={async () => {
              if (window.confirm('Populares o banco MySQL com o catálogo estático em memória?')) {
                  let alertDiv = document.createElement('div');
                  alertDiv.innerText = 'Sincronizando produtos (Aguarde alguns segundos)...';
                  alertDiv.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#111;color:#fff;padding:20px;border-radius:10px;z-index:99999;font-weight:bold;';
                  document.body.appendChild(alertDiv);
                  try {
                      for (const p of products) {
                          await apiClient.saveProduct(p);
                      }
                      alert('Sincronização mestre concluída via /api.php! Pode consultar as tabelas!');
                      window.location.reload();
                  } catch (e) {
                      alert('Erro na migração!');
                      document.body.removeChild(alertDiv);
                  }
              }
            }}
          >
            <span>⚙️</span>
            <span className="font-bold uppercase tracking-wider text-[10px]">Populate DB (Admin)</span>
          </div>
        </div>
      </div>

      {showIframe && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6" style={{ background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-5xl h-[80vh] mt-4 bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-fade-in border border-gray-200">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-4 py-3 flex justify-between items-center shrink-0">
              <div className="flex gap-2 items-center">
                <Globe className="w-5 h-5 text-violet-600" />
                <span className="text-sm font-bold text-gray-700">Explorador de Mercado (Google Live)</span>
              </div>

              <div className="flex gap-2 items-center">
                <button
                  onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(liveQuery || 'iPhone')}&udm=50`, '_blank')}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl transition shadow-md"
                >
                  <Globe className="w-4 h-4" /> Visualizar IA em Nova Aba Segura
                </button>
                <button
                  onClick={() => setShowIframe(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
                  title="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="w-full bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center gap-2 text-xs text-gray-500 shadow-inner shrink-0">
              <span className="font-mono bg-white px-2 py-1 rounded w-full overflow-hidden text-ellipsis whitespace-nowrap">
                https://www.google.com/search?q={encodeURIComponent(liveQuery || 'Apple iPhone 15 Pro Max')}&udm=50
              </span>
            </div>

            <iframe
              src={`https://www.google.com/search?q=${encodeURIComponent(liveQuery || 'Apple iPhone 15 Pro Max')}&udm=50&igu=1`}
              className="w-full h-full flex-1 border-0 bg-white"
              title="Google Web Search"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            ></iframe>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
