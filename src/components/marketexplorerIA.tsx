import React, { useState, useEffect, useRef } from 'react';
import { X, Loader2, Sparkles, AlertTriangle, ShoppingCart, ExternalLink, Trash2, Star } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  price: string;
  currency: string;
  image: string;
  url: string;
  seller: string;
  rating?: string;
  reviews?: string;
  availability?: string;
}

interface MarketExplorerIAProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export function MarketExplorerIA({ isOpen, onClose, initialQuery = '' }: MarketExplorerIAProps) {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll dos logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    if (isOpen && initialQuery) {
      handleSearch(initialQuery);
    }
  }, [isOpen, initialQuery]);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    setLogs(prev => [...prev, `[${timestamp}] ${msg}`]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const parseProductsFromHTML = (html: string): Product[] => {
    const products: Product[] = [];

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      addLog('🔍 Iniciando parsing do HTML...');

      // Seletores para produtos Bing Shopping
      const productElements = doc.querySelectorAll(
        '[data-index], .search-result-item, .product-item, [class*="product"], [class*="item-card"]'
      );

      addLog(`📦 Encontrados ${productElements.length} elementos potenciais`);

      productElements.forEach((element, index) => {
        try {
          // Extrai título
          const titleEl = element.querySelector('h2, [class*="title"], a[title]');
          const title = titleEl?.textContent?.trim() || `Produto ${index + 1}`;

          // Extrai preço
          const priceEl = element.querySelector('[class*="price"], [data-price], .price');
          const priceText = priceEl?.textContent?.trim() || 'N/A';
          
          // Extrai URL
          const linkEl = element.querySelector('a[href]') as HTMLAnchorElement;
          const url = linkEl?.href || '#';

          // Extrai imagem
          const imgEl = element.querySelector('img');
          const image = imgEl?.src || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23ccc%22 width=%22200%22 height=%22200%2[...]

          // Extrai vendedor
          const sellerEl = element.querySelector('[class*="seller"], [class*="store"]');
          const seller = sellerEl?.textContent?.trim() || 'Bing Shopping';

          // Extrai avaliação
          const ratingEl = element.querySelector('[class*="rating"], .rating');
          const rating = ratingEl?.textContent?.trim() || '';

          // Extrai disponibilidade
          const availEl = element.querySelector('[class*="available"], [class*="stock"]');
          const availability = availEl?.textContent?.trim() || 'Disponível';

          // Valida dados mínimos
          if (title && title !== `Produto ${index + 1}`) {
            const product: Product = {
              id: `product-${index}-${Date.now()}`,
              title,
              price: priceText.replace(/[^\d,.-]/g, '') || priceText,
              currency: priceText.includes('R$') ? 'R$' : priceText.includes('$') ? 'USD' : '',
              image,
              url,
              seller,
              rating: rating || undefined,
              reviews: undefined,
              availability,
            };

            products.push(product);
            addLog(`✅ Produto extraído: ${title.substring(0, 50)}...`);
          }
        } catch (err) {
          addLog(`⚠️ Erro ao processar elemento ${index}: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
        }
      });

      addLog(`🎯 Total de ${products.length} produtos extraídos com sucesso`);
    } catch (err) {
      addLog(`❌ Erro crítico no parsing: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    }

    return products;
  };

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setError('Digite um termo para pesquisar');
      return;
    }

    setLoading(true);
    setError('');
    setProducts([]);
    setLogs([]);
    setShowLogs(true);

    try {
      const bingUrl = `https://www.bing.com/shop?q=${encodeURIComponent(searchQuery)}`;
      addLog(`🔗 Acessando: ${bingUrl}`);

      // Tentativa 1: Usando proxy CORS gratuito
      const corsProxies = [
        `https://cors-anywhere.herokuapp.com/${bingUrl}`,
        `https://api.allorigins.win/raw?url=${encodeURIComponent(bingUrl)}`,
        bingUrl // Tentativa direta
      ];

      let htmlContent = '';
      let successProxy = '';

      for (const proxyUrl of corsProxies) {
        try {
          addLog(`🌐 Tentando com proxy: ${proxyUrl.substring(0, 60)}...`);
          
          const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            },
            mode: 'cors',
          });

          if (response.ok) {
            htmlContent = await response.text();
            successProxy = proxyUrl;
            addLog(`✅ Conexão bem-sucedida com proxy`);
            break;
          }
        } catch (err) {
          addLog(`⚠️ Proxy falhou: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
          continue;
        }
      }

      if (!htmlContent) {
        addLog('📝 Nenhum proxy funcionou. Usando estratégia alternativa...');
        
        // Estratégia alternativa: Mock de produtos para demonstração
        addLog('🎨 Gerando dados de exemplo para demonstração');
        const mockProducts: Product[] = [
          {
            id: 'mock-1',
            title: 'iPhone 15 Pro Max 256GB',
            price: '7.999',
            currency: 'R$',
            image: 'https://images.unsplash.com/photo-1592286927505-1def25115558?w=300&h=300&fit=crop',
            url: 'https://www.bing.com/shop',
            seller: 'Amazon Brasil',
            rating: '4.8',
            availability: 'Em estoque',
          },
          {
            id: 'mock-2',
            title: 'Samsung Galaxy S24 Ultra',
            price: '6.499',
            currency: 'R$',
            image: 'https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=300&h=300&fit=crop',
            url: 'https://www.bing.com/shop',
            seller: 'Mercado Livre',
            rating: '4.9',
            availability: 'Em estoque',
          },
          {
            id: 'mock-3',
            title: 'MacBook Pro 16" M3 Max',
            price: '12.499',
            currency: 'R$',
            image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop',
            url: 'https://www.bing.com/shop',
            seller: 'Apple Store',
            rating: '4.7',
            availability: 'Em estoque',
          },
        ];

        setProducts(mockProducts);
        addLog(`✨ ${mockProducts.length} produtos de exemplo carregados`);
        setError('Nota: Resultados de exemplo (proxies CORS limitados). Para produção, use um backend próprio.');
        return;
      }

      // Parse dos produtos
      const parsedProducts = parseProductsFromHTML(htmlContent);

      if (parsedProducts.length === 0) {
        addLog('⚠️ Nenhum produto encontrado. Tentando padrões alternativos...');
        addLog('💡 Dica: Configure um backend para scraping real');
        setError('Nenhum produto encontrado. Use um backend próprio para melhor scraping.');
      } else {
        setProducts(parsedProducts);
        addLog(`🎉 Pesquisa concluída! ${parsedProducts.length} produtos encontrados`);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      addLog(`❌ ERRO: ${errorMsg}`);
      setError(`Erro na busca: ${errorMsg}`);
    } finally {
      setLoading(false);
      addLog('✋ Busca finalizada');
    }
  };

  const handleTopRatedSearch = () => {
    if (!query.trim()) {
      setError('Digite um termo para pesquisar');
      return;
    }
    const topRatedQuery = `${query} melhor avaliado`;
    addLog(`⭐ Pesquisando produtos mais bem avaliados: "${topRatedQuery}"`);
    handleSearch(topRatedQuery);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px',
        backdropFilter: 'blur(5px)',
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '1400px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #00a4ef 0%, #0078d4 100%)',
            color: '#fff',
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid #0078d4',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShoppingCart size={28} />
            <div>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
                Market Explorer
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', opacity: 0.9 }}>
                Busca de produtos Bing Shopping
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px',
              cursor: 'pointer',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')
            }
          >
            <X size={24} />
          </button>
        </div>

        {/* Barra de Busca */}
        <div
          style={{
            padding: '20px 24px',
            background: '#f8f9fa',
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(query)}
            placeholder="Ex: iPhone, Samsung, Laptop..."
            disabled={loading}
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '12px 16px',
              fontSize: '0.95rem',
              border: '2px solid #00a4ef',
              borderRadius: '8px',
              outline: 'none',
              transition: 'all 0.2s',
              background: '#fff',
            }}
            onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 164, 239, 0.1)')}
            onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')}
          />

          <button
            onClick={() => handleSearch(query)}
            disabled={loading || !query.trim()}
            style={{
              padding: '12px 28px',
              background: loading ? '#ccc' : 'linear-gradient(135deg, #00a4ef 0%, #0078d4 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '0.95rem',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 164, 239, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Pesquisando...
              </>
            ) : (
              <>
                <ShoppingCart size={18} />
                Pesquisar
              </>
            )}
          </button>

          <button
            onClick={handleTopRatedSearch}
            disabled={loading || !query.trim()}
            style={{
              padding: '12px 20px',
              background: loading || !query.trim() ? '#ccc' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: loading || !query.trim() ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '0.95rem',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              if (!loading && query.trim()) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(245, 158, 11, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Star size={18} />
            Melhores Avaliados
          </button>

          <button
            onClick={() => setShowLogs(!showLogs)}
            style={{
              padding: '12px 16px',
              background: showLogs ? '#0078d4' : '#e0e0e0',
              color: showLogs ? '#fff' : '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.85rem',
              whiteSpace: 'nowrap',
            }}
          >
            {showLogs ? '📋 Logs' : '📋 Ver Logs'}
          </button>
        </div>

        {/* Layout Principal */}
        <div style={{ display: 'flex', flex: 1, minHeight: 0, overflowY: 'auto' }}>
          {/* Área Principal - Produtos */}
          <div style={{ flex: showLogs ? '1 1 70%' : '1 1 100%', overflowY: 'auto', padding: '24px' }}>
            {error && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '2px solid #fecaca',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  color: '#991b1b',
                }}
              >
                <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Aviso:</strong>
                  <p style={{ margin: '4px 0 0' }}>{error}</p>
                </div>
              </div>
            )}

            {loading && (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <Loader2
                  size={48}
                  color="#00a4ef"
                  className="animate-spin"
                  style={{ margin: '0 auto 16px' }}
                />
                <p style={{ fontSize: '1.1rem', color: '#333', fontWeight: '600' }}>
                  Buscando produtos...
                </p>
                <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '8px' }}>
                  Isso pode levar alguns segundos
                </p>
              </div>
            )}

            {!loading && products.length === 0 && !error && (
              <div style={{ textAlign: 'center', marginTop: '80px', color: '#999' }}>
                <ShoppingCart size={64} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                <p style={{ fontSize: '1.1rem', color: '#999', fontWeight: '500' }}>
                  Digite um termo e pesquise para encontrar produtos
                </p>
              </div>
            )}

            {/* Grid de Produtos */}
            {!loading && products.length > 0 && (
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px', color: '#333' }}>
                  📦 {products.length} Produtos Encontrados
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                    gap: '16px',
                  }}
                >
                  {products.map((product) => (
                    <div
                      key={product.id}
                      style={{
                        background: '#fff',
                        border: '1px solid #e0e0e0',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        transition: 'all 0.3s',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget;
                        el.style.transform = 'translateY(-8px)';
                        el.style.boxShadow = '0 8px 24px rgba(0, 164, 239, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget;
                        el.style.transform = 'translateY(0)';
                        el.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
                      }}
                    >
                      {/* Imagem */}
                      <div
                        style={{
                          width: '100%',
                          height: '200px',
                          background: '#f0f0f0',
                          overflow: 'hidden',
                        }}
                      >
                        <img
                          src={product.image}
                          alt={product.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.3s',
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.transform = 'scale(1.1)')
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.transform = 'scale(1)')
                          }
                        />
                      </div>

                      {/* Conteúdo */}
                      <div style={{ padding: '16px' }}>
                        {/* Titulo */}
                        <h4
                          style={{
                            margin: '0 0 8px',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            color: '#333',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            minHeight: '2.8em',
                          }}
                        >
                          {product.title}
                        </h4>

                        {/* Preço */}
                        <div
                          style={{
                            fontSize: '1.3rem',
                            fontWeight: '700',
                            color: '#0078d4',
                            marginBottom: '8px',
                          }}
                        >
                          {product.currency} {product.price}
                        </div>

                        {/* Rating */}
                        {product.rating && (
                          <div
                            style={{
                              fontSize: '0.85rem',
                              color: '#666',
                              marginBottom: '8px',
                            }}
                          >
                            ⭐ {product.rating}
                          </div>
                        )}

                        {/* Vendedor */}
                        <div
                          style={{
                            fontSize: '0.8rem',
                            color: '#999',
                            marginBottom: '8px',
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          🏪 {product.seller}
                        </div>

                        {/* Disponibilidade */}
                        <div
                          style={{
                            fontSize: '0.8rem',
                            color: '#10b981',
                            marginBottom: '12px',
                            fontWeight: '500',
                          }}
                        >
                          ✓ {product.availability}
                        </div>

                        {/* Link */}
                        <a
                          href={product.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 16px',
                            background: 'linear-gradient(135deg, #00a4ef 0%, #0078d4 100%)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            width: '100%',
                            justifyContent: 'center',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                            e.currentTarget.style.boxShadow =
                              '0 4px 12px rgba(0, 164, 239, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <ExternalLink size={16} />
                          Ver Produto
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Painel de Logs */}
          {showLogs && (
            <div
              style={{
                width: '30%',
                borderLeft: '1px solid #e0e0e0',
                display: 'flex',
                flexDirection: 'column',
                background: '#1e293b',
                color: '#f1f5f9',
              }}
            >
              {/* Header Logs */}
              <div
                style={{
                  padding: '16px',
                  borderBottom: '1px solid #334155',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <strong style={{ fontSize: '0.9rem' }}>📋 Log de Operações</strong>
                <button
                  onClick={clearLogs}
                  style={{
                    background: '#ef5350',
                    border: 'none',
                    color: '#fff',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Trash2 size={14} />
                  Limpar
                </button>
              </div>

              {/* Conteúdo Logs */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '16px',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  lineHeight: '1.6',
                }}
              >
                {logs.length === 0 ? (
                  <div style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                    Aguardando operações...
                  </div>
                ) : (
                  logs.map((log, idx) => (
                    <div
                      key={idx}
                      style={{
                        marginBottom: '8px',
                        paddingBottom: '8px',
                        borderBottom: '1px solid #334155',
                        color: log.includes('❌')
                          ? '#fca5a5'
                          : log.includes('✅')
                            ? '#86efac'
                            : log.includes('⚠️')
                              ? '#fbbf24'
                              : '#cbd5e1',
                      }}
                    >
                      {log}
                    </div>
                  ))
                )}
                <div ref={logsEndRef} />
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes animate-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: animate-spin 1s linear infinite;
        }
        
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
