import { useState, useEffect, useRef } from 'react';
import { X, Loader2, ExternalLink, Sparkles, MessageSquare, AlertTriangle, Key, Eye } from 'lucide-react';

// ─── API Configuration ───────────────────────────────────────────────────────
const SCRAPINGBEE_API_KEY = import.meta.env.VITE_SCRAPINGBEE_API_KEY || 
                            process.env.NEXT_PUBLIC_SCRAPINGBEE_API_KEY || 
                            '';

const SCRAPINGBEE_API_URL = 'https://app.scrapingbee.com/api/v1/google';

// ─── Types ──────────────────────────────────────────────────────────────────
interface ScrapingBeeMetaData {
  url?: string;
  number_of_results?: number | null;
  zero_results_for_original_query?: boolean | null;
  location?: string | null;
  number_of_organic_results?: number;
  number_of_ads?: number;
  number_of_page?: number | null;
}

interface AIModeAnswer {
  citations: Citation[];
  links: AILink[];
  prompt: string;
  response_text: string;
}

interface Citation {
  text: string;
  urls: string[];
}

interface AILink {
  publisher: string;
  text: string;
  url: string;
}

interface ScrapingBeeResponse {
  meta_data?: ScrapingBeeMetaData;
  organic_results?: unknown[];
  ai_overviews?: unknown[];
  top_ads?: unknown[];
  bottom_ads?: unknown[];
  shopping_ads?: unknown[];
  related_queries?: unknown[];
  questions?: unknown[];
  top_stories?: unknown[];
  news_results?: unknown[];
  local_results?: unknown[];
  hotel_results?: unknown[];
  knowledge_graph?: Record<string, unknown>;
  related_searches?: unknown[];
  ai_mode_answer?: AIModeAnswer;
  html?: string;
}

interface ProcessedResult {
  publisher: string;
  title: string;
  url: string;
  source: 'ai_answer' | 'direct_link';
}

interface MarketExplorerIAProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  apiKey?: string;
}

// ─── Helper Functions ───────────────────────────────────────────────────────
function getApiKey(propKey?: string): string {
  return propKey || 
         import.meta.env?.VITE_SCRAPINGBEE_API_KEY || 
         process.env?.NEXT_PUBLIC_SCRAPINGBEE_API_KEY || 
         '';
}

function buildApiUrl(query: string, apiKey: string): string {
  const params = new URLSearchParams({
    api_key: apiKey,
    search: query,
    search_type: 'ai_mode',
    country_code: 'br',
    nb_results: '10',
  });

  return `${SCRAPINGBEE_API_URL}?${params.toString()}`;
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname || 'desconhecido';
  } catch {
    return 'desconhecido';
  }
}

// ─── API Call Function ──────────────────────────────────────────────────────
async function fetchMarketData(
  query: string,
  apiKey: string
): Promise<{
  data: ScrapingBeeResponse;
  apiUrl: string;
}> {
  if (!apiKey) {
    throw new Error('⚠️ API Key não configurada. Configure VITE_SCRAPINGBEE_API_KEY no .env');
  }

  if (!query.trim()) {
    throw new Error('Digite um termo para pesquisar');
  }

  const apiUrl = buildApiUrl(query, apiKey);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    console.log('🔍 Pesquisando:', query);

    const response = await fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro ScrapingBee:', response.status, errorText.slice(0, 200));

      switch (response.status) {
        case 401:
          throw new Error('API Key inválida. Verifique seu arquivo .env');
        case 403:
          throw new Error('Acesso negado. Verifique se sua API Key tem permissões suficientes');
        case 429:
          throw new Error('Limite de requisições excedido. Aguarde alguns minutos');
        default:
          throw new Error(`Erro ${response.status}: ${errorText.slice(0, 150)}`);
      }
    }

    const data: ScrapingBeeResponse = await response.json();
    console.log('✅ Resposta recebida:', data);

    return { data, apiUrl };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Tempo limite excedido (30s). Verifique sua conexão');
    }
    throw error;
  }
}

// ─── Data Processing Functions ──────────────────────────────────────────────
function processAIModeAnswer(aiAnswer?: AIModeAnswer): ProcessedResult[] {
  if (!aiAnswer) return [];

  const results: ProcessedResult[] = [];

  // Processar citações com seus links
  if (aiAnswer.citations && Array.isArray(aiAnswer.citations)) {
    aiAnswer.citations.forEach((citation, idx) => {
      if (citation.urls && citation.urls.length > 0) {
        results.push({
          publisher: 'IA - Citação',
          title: citation.text.slice(0, 100) + '...',
          url: citation.urls[0], // Usa o primeiro URL como principal
          source: 'ai_answer',
        });
      }
    });
  }

  // Processar links diretos
  if (aiAnswer.links && Array.isArray(aiAnswer.links)) {
    aiAnswer.links.forEach((link) => {
      results.push({
        publisher: link.publisher,
        title: link.text,
        url: link.url,
        source: 'direct_link',
      });
    });
  }

  return results;
}

// ─── Main Component ─────────────────────────────────────────────────────────
export function MarketExplorerIA({
  isOpen,
  onClose,
  initialQuery = '',
  apiKey: propApiKey,
}: MarketExplorerIAProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [apiKey] = useState(() => getApiKey(propApiKey));

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<ProcessedResult[]>([]);
  const [aiResponseText, setAiResponseText] = useState('');
  const [citations, setCitations] = useState<Citation[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const [apiUrl, setApiUrl] = useState('');

  async function performSearch(term: string = query) {
    if (!term.trim()) {
      setStatus('Digite um termo para pesquisar');
      return;
    }

    if (!apiKey) {
      setError('⚠️ API Key não encontrada. Configure o arquivo .env com VITE_SCRAPINGBEE_API_KEY=sua_chave');
      setShowConfig(true);
      return;
    }

    setResults([]);
    setAiResponseText('');
    setCitations([]);
    setStatus('');
    setError('');
    setLoading(true);

    const startTime = Date.now();

    try {
      const { data, apiUrl: fetchedUrl } = await fetchMarketData(term, apiKey);
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      setApiUrl(fetchedUrl);

      // Processar resposta de IA
      const aiAnswer = data.ai_mode_answer;
      if (aiAnswer) {
        setAiResponseText(aiAnswer.response_text);
        setCitations(aiAnswer.citations || []);

        const processedResults = processAIModeAnswer(aiAnswer);
        setResults(processedResults);

        setStatus(
          `✅ ${processedResults.length} resultados encontrados em ${duration}s`
        );
      } else {
        setError('Nenhum resultado de IA encontrado');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(message);
      console.error('❌ Erro:', err);
    } finally {
      setLoading(false);
    }
  }

  // Auto-focus input
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Initial search if query provided
  useEffect(() => {
    if (isOpen && initialQuery && apiKey) {
      performSearch(initialQuery);
    }
  }, [isOpen, initialQuery]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #f5f7fa 0%, #f0f2f5 100%)',
          borderRadius: '20px',
          maxWidth: '1200px',
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            padding: '20px 24px',
            borderRadius: '20px 20px 0 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Sparkles size={24} />
            <div>
              <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>
                Market Explorer IA
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', opacity: 0.9 }}>
                Pesquisa inteligente de mercado
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {apiUrl && (
              <a
                href={apiUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Ver resposta bruta da API"
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px',
                  cursor: 'pointer',
                  color: '#fff',
                  transition: 'background 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.3)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
              >
                <Eye size={18} />
              </a>
            )}

            <button
              onClick={() => setShowConfig(!showConfig)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '8px',
                padding: '8px',
                cursor: 'pointer',
                color: '#fff',
                transition: 'background 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.3)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
            >
              <Key size={18} />
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '8px',
                padding: '8px',
                cursor: 'pointer',
                color: '#fff',
                transition: 'background 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.3)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Config Panel */}
        {showConfig && (
          <div
            style={{
              background: '#fff9e6',
              borderBottom: '1px solid #ffe58f',
              padding: '16px 24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <Key
                size={20}
                color="#fa8c16"
                style={{ marginTop: '2px', flexShrink: 0 }}
              />
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    margin: '0 0 8px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: '#333',
                  }}
                >
                  Configuração da API Key
                </p>
                <p
                  style={{
                    margin: '0 0 12px',
                    fontSize: '0.85rem',
                    color: '#666',
                    lineHeight: 1.5,
                  }}
                >
                  {apiKey ? (
                    <>
                      ✅ API Key configurada:{' '}
                      <code
                        style={{
                          background: '#f0f0f0',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                        }}
                      >
                        {apiKey.slice(0, 8)}...{apiKey.slice(-4)}
                      </code>
                    </>
                  ) : (
                    'Configure a variável de ambiente VITE_SCRAPINGBEE_API_KEY no arquivo .env'
                  )}
                </p>
                <details style={{ fontSize: '0.8rem', color: '#666' }}>
                  <summary
                    style={{
                      cursor: 'pointer',
                      fontWeight: 500,
                      marginBottom: '8px',
                    }}
                  >
                    Como configurar
                  </summary>
                  <ol
                    style={{
                      margin: '8px 0',
                      paddingLeft: '20px',
                      lineHeight: 1.6,
                    }}
                  >
                    <li>
                      Crie um arquivo <code>.env.local</code> na raiz do projeto
                    </li>
                    <li>
                      Adicione:{' '}
                      <code>VITE_SCRAPINGBEE_API_KEY=sua_chave_aqui</code>
                    </li>
                    <li>Reinicie o servidor de desenvolvimento</li>
                  </ol>
                </details>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div
          style={{
            padding: '20px 24px',
            background: '#fff',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              performSearch();
            }}
            style={{ display: 'flex', gap: '12px' }}
          >
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ex: tendências de IA, concorrentes fintech, mercado SaaS..."
              disabled={loading || !apiKey}
              style={{
                flex: 1,
                padding: '14px 18px',
                fontSize: '0.95rem',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                outline: 'none',
                transition: 'all 0.2s',
                background: !apiKey ? '#f5f5f5' : '#fff',
              }}
              onFocus={(e) => {
                if (apiKey) {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102,126,234,0.1)';
                }
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            />
            <button
              type="submit"
              disabled={loading || !query.trim() || !apiKey}
              style={{
                background:
                  loading || !query.trim() || !apiKey
                    ? '#ccc'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                border: 'none',
                padding: '14px 28px',
                fontSize: '0.95rem',
                fontWeight: 600,
                borderRadius: '12px',
                cursor:
                  loading || !query.trim() || !apiKey ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow:
                  loading || !query.trim() || !apiKey
                    ? 'none'
                    : '0 4px 12px rgba(102,126,234,0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              onMouseEnter={(e) => {
                if (!loading && query.trim() && apiKey) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow =
                    '0 6px 16px rgba(102,126,234,0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && query.trim() && apiKey) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow =
                    '0 4px 12px rgba(102,126,234,0.3)';
                }
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Pesquisando...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Pesquisar
                </>
              )}
            </button>
          </form>

          {/* Status */}
          {status && (
            <p
              style={{
                margin: '12px 0 0',
                fontSize: '0.85rem',
                color: '#10b981',
                fontWeight: 500,
              }}
            >
              {status}
            </p>
          )}
        </div>

        {/* Content */}
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            minHeight: 0,
          }}
        >
          {/* Loading */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <Loader2
                size={48}
                color="#667eea"
                className="animate-spin"
                style={{ margin: '0 auto 16px' }}
              />
              <p style={{ fontSize: '1rem', color: '#666' }}>
                Analisando mercado com IA...
              </p>
              <p
                style={{
                  fontSize: '0.85rem',
                  color: '#999',
                  marginTop: '8px',
                }}
              >
                Isso pode levar alguns segundos
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              style={{
                background: '#fef2f2',
                border: '2px solid #fecaca',
                borderRadius: '12px',
                padding: '16px',
                color: '#991b1b',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
              }}
            >
              <AlertTriangle
                size={18}
                style={{ flexShrink: 0, marginTop: '2px' }}
              />
              <div>
                <strong>Erro na pesquisa:</strong>
                <p style={{ margin: '4px 0 0', whiteSpace: 'pre-wrap' }}>
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Initial State */}
          {!loading && !error && !status && (
            <div style={{ textAlign: 'center', marginTop: '80px', color: '#bbb' }}>
              <p style={{ fontSize: '3rem' }}>🔍</p>
              <p style={{ marginTop: '12px', fontSize: '1rem', color: '#999' }}>
                Pesquise para descobrir insights de mercado
              </p>
              {apiKey ? (
                <p style={{ fontSize: '0.8rem', color: '#aaa' }}>
                  Exemplos: "tendências IA 2024", "concorrentes fintech"
                </p>
              ) : (
                <p style={{ fontSize: '0.8rem', color: '#ef5350' }}>
                  ⚠️ Configure a API Key no arquivo .env para começar
                </p>
              )}
            </div>
          )}

          {/* AI Response Text */}
          {aiResponseText && (
            <div style={{ marginBottom: '24px' }}>
              <h3
                style={{
                  fontSize: '0.95rem',
                  color: '#444',
                  marginBottom: '12px',
                }}
              >
                <Sparkles
                  size={16}
                  color="#667eea"
                  style={{ marginRight: '8px' }}
                />
                Análise IA
              </h3>
              <div
                style={{
                  background: '#fff',
                  borderRadius: '10px',
                  padding: '18px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  lineHeight: 1.6,
                  color: '#555',
                }}
              >
                {aiResponseText}
              </div>
            </div>
          )}

          {/* Citations */}
          {citations.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3
                style={{
                  fontSize: '0.95rem',
                  color: '#444',
                  marginBottom: '12px',
                }}
              >
                <MessageSquare
                  size={16}
                  color="#764ba2"
                  style={{ marginRight: '8px' }}
                />
                Citações
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {citations.map((citation, i) => (
                  <details
                    key={i}
                    style={{
                      background: '#fff',
                      borderRadius: '10px',
                      padding: '16px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      cursor: 'pointer',
                    }}
                  >
                    <summary
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        color: '#333',
                        padding: '4px 0',
                        listStyle: 'none',
                      }}
                    >
                      {citation.text.slice(0, 80)}...
                    </summary>
                    <div
                      style={{
                        marginTop: '12px',
                        paddingLeft: '8px',
                        borderLeft: '3px solid #667eea33',
                      }}
                    >
                      <p
                        style={{
                          fontSize: '0.85rem',
                          color: '#555',
                          lineHeight: 1.6,
                          marginBottom: '8px',
                        }}
                      >
                        {citation.text}
                      </p>
                      <div
                        style={{
                          display: 'flex',
                          gap: '8px',
                          flexWrap: 'wrap',
                        }}
                      >
                        {citation.urls.map((url, j) => (
                          <a
                            key={j}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: '0.75rem',
                              color: '#667eea',
                              textDecoration: 'none',
                              background: '#f0f0f0',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              transition: 'background 0.2s',
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = '#e0e0e0')
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = '#f0f0f0')
                            }
                          >
                            Fonte {j + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          )}

          {/* Results Links */}
          {results.length > 0 && (
            <div>
              <h3
                style={{
                  fontSize: '0.95rem',
                  color: '#444',
                  marginBottom: '12px',
                }}
              >
                <ExternalLink
                  size={16}
                  color="#764ba2"
                  style={{ marginRight: '8px' }}
                />
                Links Relevantes
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {results.map((item, i) => (
                  <a
                    key={i}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: '#fff',
                      borderRadius: '10px',
                      padding: '18px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      textDecoration: 'none',
                      transition: 'box-shadow 0.2s, transform 0.2s',
                      display: 'block',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow =
                        '0 4px 16px rgba(0,0,0,0.12)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow =
                        '0 2px 8px rgba(0,0,0,0.08)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '8px',
                      }}
                    >
                      <span
                        style={{
                          background:
                            item.source === 'ai_answer'
                              ? 'linear-gradient(135deg, #667eea, #764ba2)'
                              : 'linear-gradient(135deg, #f093fb, #f5576c)',
                          color: '#fff',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '12px',
                        }}
                      >
                        {item.source === 'ai_answer' ? 'IA' : 'LINK'}
                      </span>
                      <span
                        style={{
                          fontSize: '0.78rem',
                          color: '#888',
                          fontWeight: 500,
                        }}
                      >
                        {item.publisher}
                      </span>
                    </div>

                    <p
                      style={{
                        fontSize: '1.05rem',
                        fontWeight: 600,
                        color: '#1a0dab',
                        margin: 0,
                        lineHeight: 1.4,
                      }}
                    >
                      {item.title}
                    </p>

                    <div
                      style={{
                        marginTop: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#667eea',
                        fontSize: '0.85rem',
                      }}
                    >
                      <ExternalLink size={12} />
                      Visitar
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      <style>{`
        @keyframes animate-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: animate-spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
