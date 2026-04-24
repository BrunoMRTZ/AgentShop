import { useState, useEffect, useRef } from 'react';
import { X, Loader2, ExternalLink, Sparkles, MessageSquare, AlertTriangle, Key } from 'lucide-react';

// ─── Configuração da API ─────────────────────────────────────────────────────
// A chave é carregada das variáveis de ambiente
const SCRAPINGBEE_API_KEY = import.meta.env.VITE_SCRAPINGBEE_API_KEY || 
                            process.env.SCRAPINGBEE_API_KEY || 
                           '';

interface MarketExplorerIAProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  apiKey?: string; // Opcional: permite sobrescrever a chave do .env
}

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface ScrapingBeeResponse {
  meta_data?: {
    url?: string;
    number_of_results?: number;
    location?: string;
    number_of_organic_results?: number;
  };
  organic_results?: OrganicResult[];
  related_questions?: RelatedQuestion[];
  top_stories?: TopStory[];
}

interface OrganicResult {
  url: string;
  displayed_url?: string;
  description: string;
  position: number;
  title: string;
  domain?: string;
  rich_snippet?: Record<string, unknown>;
  date?: string | null;
  thumbnail_url?: string | null;
  sitelinks?: Sitelink[];
}

interface Sitelink {
  title: string;
  link: string;
  description?: string;
}

interface RelatedQuestion {
  question: string;
  answer: string;
  url: string;
  title?: string;
}

interface TopStory {
  title: string;
  url: string;
  source: string;
  date?: string;
  image_url?: string;
}

interface IAItem {
  titulo: string;
  descricao: string;
  url: string;
  dominio: string;
  data?: string;
  posicao: number;
}

// ─── Função helper para obter a chave API ───────────────────────────────────
function getApiKey(propKey?: string): string {
  // Prioridade: prop > env Vite > env Next.js > env Node
  return propKey || 
         import.meta.env?.VITE_SCRAPINGBEE_API_KEY || 
         process.env?.NEXT_PUBLIC_SCRAPINGBEE_API_KEY || 
         process.env?.SCRAPINGBEE_API_KEY || 
         'PYNH3MAHGQ1D44HT83NQX0G5D9SSI3MH4PDTPHQWPPQAK392QXFXEHTHUEWNUOCNUVKHY7WCCDGPDGBG';
}

// ─── Busca via ScrapingBee ────────────────────────────────────────────────────
async function buscarComIA(
  busca: string, 
  apiKey: string
): Promise<{ 
  resultados: IAItem[]; 
  perguntasRelacionadas: RelatedQuestion[];
  topStories: TopStory[];
}> {
  if (!apiKey) {
    apiKey= 'PYNH3MAHGQ1D44HT83NQX0G5D9SSI3MH4PDTPHQWPPQAK392QXFXEHTHUEWNUOCNUVKHY7WCCDGPDGBG';
  }

  const params = new URLSearchParams({
    api_key: 'PYNH3MAHGQ1D44HT83NQX0G5D9SSI3MH4PDTPHQWPPQAK392QXFXEHTHUEWNUOCNUVKHY7WCCDGPDGBG',
    search: busca,
    search_type: 'ai_mode',  // ✅ CORRIGIDO: Adicionado ai_mode
    country_code: 'br',
    add_html: 'true',        // ✅ CORRIGIDO: Adicionado add_html
    nb_results: '10',
  });

  // ✅ CORRIGIDO: Mudado de /store/google para /google
  const url = 'https://app.scrapingbee.com/api/v1/google?api_key=PYNH3MAHGQ1D44HT83NQX0G5D9SSI3MH4PDTPHQWPPQAK392QXFXEHTHUEWNUOCNUVKHY7WCCDGPDGBG&search=aspirador+para+carro+12volts&search_type=ai_mode&country_code=br'
  // `https://app.scrapingbee.com/api/v1/google?${params.toString()}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    console.log('🔍 Pesquisando:', busca);
    console.log('🌐 URL:', url); // Para debug
    
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      }
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ Erro ScrapingBee:', res.status, errorText.slice(0, 200));

      switch (res.status) {
        case 401:
          throw new Error('API Key inválida. Verifique seu arquivo .env');
        case 403:
          throw new Error('Acesso negado. Verifique se sua API Key tem permissões suficientes');
        case 429:
          throw new Error('Limite de requisições excedido. Aguarde alguns minutos');
        default:
          throw new Error(`Erro ${res.status}: ${errorText.slice(0, 150)}`);
      }
    }

    const data: ScrapingBeeResponse = await res.json();
    
    console.log('✅ Resposta recebida:', {
      organic: data.organic_results?.length || 0,
      questions: data.related_questions?.length || 0,
      stories: data.top_stories?.length || 0,
      raw: data // ✅ Adicionado para debug completo
    });

    // Processa resultados orgânicos
    const resultados: IAItem[] = (data.organic_results ?? []).map((item, index): IAItem => ({
      titulo: item.title || 'Sem título',
      descricao: item.description || 'Sem descrição disponível',
      url: item.url || '#',
      dominio: item.domain || (() => {
        try { return new URL(item.url || 'http://localhost').hostname; } 
        catch { return item.displayed_url || 'desconhecido'; }
      })(),
      data: item.date || undefined,
      posicao: item.position || index + 1,
    }));

    return {
      resultados,
      perguntasRelacionadas: data.related_questions || [],
      topStories: data.top_stories || [],
    };

  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Tempo limite excedido (30s). Verifique sua conexão');
    }
    throw error;
  }
}

// ─── Componente ───────────────────────────────────────────────────────────────
export function MarketExplorerIA({ 
  isOpen, 
  onClose, 
  initialQuery = '',
  apiKey: propApiKey
}: MarketExplorerIAProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [apiKey] = useState(() => getApiKey(propApiKey));

  const [query, setQuery] = useState(initialQuery);
  const [resultados, setResultados] = useState<IAItem[]>([]);
  const [perguntasRelacionadas, setPerguntasRelacionadas] = useState<RelatedQuestion[]>([]);
  const [topStories, setTopStories] = useState<TopStory[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [erro, setErro] = useState('');
  const [mostrarConfig, setMostrarConfig] = useState(false);

  async function buscar(termo: string = query) {
    if (!termo.trim()) {
      setStatus('Digite um termo para pesquisar');
      return;
    }

    if (!apiKey) {
      setErro('⚠️ API Key não encontrada. Configure o arquivo .env com SCRAPINGBEE_API_KEY=sua_chave');
      setMostrarConfig(true);
      return;
    }

    setResultados([]);
    setPerguntasRelacionadas([]);
    setTopStories([]);
    setStatus('');
    setErro('');
    setLoading(true);

    const inicio = Date.now();

    try {
      const data = await buscarComIA(termo, apiKey);
      const tempo = ((Date.now() - inicio) / 1000).toFixed(2);
      
      setResultados(data.resultados);
      setPerguntasRelacionadas(data.perguntasRelacionadas);
      setTopStories(data.topStories);
      
      const total = data.resultados.length + 
                   data.perguntasRelacionadas.length + 
                   data.topStories.length;
      
      setStatus(`✅ ${total} resultados encontrados em ${tempo}s`);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erro desconhecido';
      setErro(message);
      console.error('❌ Erro:', e);
    } finally {
      setLoading(false);
    }
  }

  // Focus automático
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Busca inicial se houver query
  useEffect(() => {
    if (isOpen && initialQuery && apiKey) {
      buscar(initialQuery);
    }
  }, [isOpen, initialQuery]);

  if (!isOpen) return null;

  return (
    <div style={{
      position:'fixed',
      top:0,
      left:0,
      right:0,
      bottom:0,
      background:'rgba(0,0,0,0.6)',
      display:'flex',
      alignItems:'center',
      justifyContent:'center',
      zIndex:10000,
      padding:'20px',
      backdropFilter:'blur(4px)'
    }}>
      <div style={{
        background:'linear-gradient(135deg, #f5f7fa 0%, #f0f2f5 100%)',
        borderRadius:'20px',
        maxWidth:'1200px',
        width:'100%',
        maxHeight:'92vh',
        display:'flex',
        flexDirection:'column',
        boxShadow:'0 20px 60px rgba(0,0,0,0.3)',
        position:'relative'
      }}>
        {/* Header */}
        <div style={{
          background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color:'#fff',
          padding:'20px 24px',
          borderRadius:'20px 20px 0 0',
          display:'flex',
          alignItems:'center',
          justifyContent:'space-between',
          boxShadow:'0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <Sparkles size={24} />
            <div>
              <h2 style={{ margin:0, fontSize:'1.3rem', fontWeight:700 }}>
                Market Explorer IA
              </h2>
              <p style={{ margin:'4px 0 0', fontSize:'0.85rem', opacity:0.9 }}>
                Pesquisa inteligente de mercado
              </p>
            </div>
          </div>
          
          <div style={{ display:'flex', gap:'8px' }}>
            <button 
              onClick={() => setMostrarConfig(!mostrarConfig)}
              style={{ 
                background:'rgba(255,255,255,0.2)',
                border:'none',
                borderRadius:'8px',
                padding:'8px',
                cursor:'pointer',
                color:'#fff',
                transition:'background 0.2s',
                display:'flex',
                alignItems:'center',
                justifyContent:'center'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            >
              <Key size={18} />
            </button>
            
            <button 
              onClick={onClose}
              style={{ 
                background:'rgba(255,255,255,0.2)',
                border:'none',
                borderRadius:'8px',
                padding:'8px',
                cursor:'pointer',
                color:'#fff',
                transition:'background 0.2s',
                display:'flex',
                alignItems:'center',
                justifyContent:'center'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Config Panel */}
        {mostrarConfig && (
          <div style={{
            background:'#fff9e6',
            borderBottom:'1px solid #ffe58f',
            padding:'16px 24px'
          }}>
            <div style={{ display:'flex', alignItems:'flex-start', gap:'12px' }}>
              <Key size={20} color="#fa8c16" style={{ marginTop:'2px', flexShrink:0 }} />
              <div style={{ flex:1 }}>
                <p style={{ margin:'0 0 8px', fontSize:'0.9rem', fontWeight:600, color:'#333' }}>
                  Configuração da API Key
                </p>
                <p style={{ margin:'0 0 12px', fontSize:'0.85rem', color:'#666', lineHeight:1.5 }}>
                  {apiKey ? (
                    <>
                      ✅ API Key configurada: <code style={{ background:'#f0f0f0', padding:'2px 6px', borderRadius:'4px', fontSize:'0.8rem' }}>
                        {apiKey.slice(0, 8)}...{apiKey.slice(-4)}
                      </code>
                    </>
                  ) : (
                    'Configure a variável de ambiente SCRAPINGBEE_API_KEY no arquivo .env'
                  )}
                </p>
                <details style={{ fontSize:'0.8rem', color:'#666' }}>
                  <summary style={{ cursor:'pointer', fontWeight:500, marginBottom:'8px' }}>
                    Como configurar
                  </summary>
                  <ol style={{ margin:'8px 0', paddingLeft:'20px', lineHeight:1.6 }}>
                    <li>Crie um arquivo <code>.env</code> na raiz do projeto</li>
                    <li>Adicione: <code>SCRAPINGBEE_API_KEY=sua_chave_aqui</code></li>
                    <li>Reinicie o servidor de desenvolvimento</li>
                  </ol>
                </details>
              </div>
            </div>
          </div>
        )}

        {/* Barra de Busca */}
        <div style={{ padding:'20px 24px', background:'#fff', borderBottom:'1px solid #e5e7eb' }}>
          <form 
            onSubmit={(e) => { e.preventDefault(); buscar(); }}
            style={{ display:'flex', gap:'12px' }}
          >
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Ex: tendências de IA, concorrentes fintech, mercado SaaS..."
              disabled={loading || !apiKey}
              style={{
                flex:1,
                padding:'14px 18px',
                fontSize:'0.95rem',
                border:'2px solid #e5e7eb',
                borderRadius:'12px',
                outline:'none',
                transition:'all 0.2s',
                background: !apiKey ? '#f5f5f5' : '#fff'
              }}
              onFocus={e => {
                if (apiKey) {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102,126,234,0.1)';
                }
              }}
              onBlur={e => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            />
            <button
              type="submit"
              disabled={loading || !query.trim() || !apiKey}
              style={{
                background: (loading || !query.trim() || !apiKey) 
                  ? '#ccc' 
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color:'#fff',
                border:'none',
                padding:'14px 28px',
                fontSize:'0.95rem',
                fontWeight:600,
                borderRadius:'12px',
                cursor: (loading || !query.trim() || !apiKey) ? 'not-allowed' : 'pointer',
                transition:'all 0.2s',
                boxShadow: (loading || !query.trim() || !apiKey) 
                  ? 'none' 
                  : '0 4px 12px rgba(102,126,234,0.3)',
                display:'flex',
                alignItems:'center',
                gap:'8px'
              }}
              onMouseEnter={e => {
                if (!loading && query.trim() && apiKey) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(102,126,234,0.4)';
                }
              }}
              onMouseLeave={e => {
                if (!loading && query.trim() && apiKey) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(102,126,234,0.3)';
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
            <p style={{ 
              margin:'12px 0 0', 
              fontSize:'0.85rem', 
              color:'#10b981',
              fontWeight:500
            }}>
              {status}
            </p>
          )}
        </div>

        {/* Conteúdo */}
        <main style={{
          flex:1,
          overflowY:'auto',
          padding:'24px',
          minHeight:0
        }}>
          {/* Loading */}
          {loading && (
            <div style={{ textAlign:'center', padding:'60px 20px' }}>
              <Loader2 
                size={48} 
                color="#667eea" 
                className="animate-spin"
                style={{ margin:'0 auto 16px' }}
              />
              <p style={{ fontSize:'1rem', color:'#666' }}>
                Analisando mercado com IA...
              </p>
              <p style={{ fontSize:'0.85rem', color:'#999', marginTop:'8px' }}>
                Isso pode levar alguns segundos
              </p>
            </div>
          )}

          {/* Erro */}
          {erro && (
            <div style={{
              background:'#fef2f2',
              border:'2px solid #fecaca',
              borderRadius:'12px',
              padding:'16px',
              color:'#991b1b',
              display:'flex',
              alignItems:'flex-start',
              gap:'10px'
            }}>
              <AlertTriangle size={18} style={{ flexShrink:0, marginTop:'2px' }} />
              <div>
                <strong>Erro na pesquisa:</strong>
                <p style={{ margin:'4px 0 0', whiteSpace:'pre-wrap' }}>{erro}</p>
              </div>
            </div>
          )}

          {/* Estado inicial */}
          {!loading && !erro && !status && (
            <div style={{ textAlign:'center', marginTop:'80px', color:'#bbb' }}>
              <p style={{ fontSize:'3rem' }}>🔍</p>
              <p style={{ marginTop:'12px', fontSize:'1rem', color:'#999' }}>
                Pesquise para descobrir insights de mercado
              </p>
              {apiKey ? (
                <p style={{ fontSize:'0.8rem', color:'#aaa' }}>
                  Exemplos: "tendências IA 2024", "concorrentes fintech"
                </p>
              ) : (
                <p style={{ fontSize:'0.8rem', color:'#ef5350' }}>
                  ⚠️ Configure a API Key no arquivo .env para começar
                </p>
              )}
            </div>
          )}

          {/* Top Stories */}
          {topStories.length > 0 && (
            <div style={{ marginBottom:'24px' }}>
              <h3 style={{ fontSize:'0.95rem', color:'#444', marginBottom:'12px' }}>
                <Sparkles size={16} color="#667eea" style={{ marginRight:'8px' }} />
                Principais Notícias
              </h3>
              <div style={{ 
                display:'grid', 
                gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', 
                gap:'12px' 
              }}>
                {topStories.map((story, i) => (
                  <div key={i} style={{
                    background:'#fff',
                    borderRadius:'10px',
                    padding:'16px',
                    boxShadow:'0 2px 8px rgba(0,0,0,0.08)',
                    transition:'transform 0.2s, box-shadow 0.2s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                  }}>
                    <p style={{ fontSize:'0.78rem', color:'#888', margin:'0 0 8px 0' }}>
                      {story.source} {story.date && `• ${story.date}`}
                    </p>
                    <a href={story.url} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize:'0.9rem', fontWeight:600, color:'#1a0dab', textDecoration:'none', lineHeight:1.4 }}>
                      {story.title}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resultados Orgânicos */}
          {resultados.length > 0 && (
            <div>
              <h3 style={{ fontSize:'0.95rem', color:'#444', marginBottom:'12px' }}>
                <ExternalLink size={16} color="#764ba2" style={{ marginRight:'8px' }} />
                Resultados da Pesquisa
              </h3>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                {resultados.map((item, i) => (
                  <div key={i}
                    style={{ 
                      background:'#fff', 
                      borderRadius:'10px', 
                      padding:'18px', 
                      boxShadow:'0 2px 8px rgba(0,0,0,0.08)', 
                      transition:'box-shadow 0.2s, transform 0.2s'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}>
                    
                    <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px' }}>
                      <span style={{ 
                        background:'linear-gradient(135deg, #667eea, #764ba2)', 
                        color:'#fff', 
                        fontSize:'0.7rem', 
                        fontWeight:700, 
                        padding:'3px 8px', 
                        borderRadius:'12px' 
                      }}>
                        #{item.posicao}
                      </span>
                      <span style={{ fontSize:'0.78rem', color:'#888', fontWeight:500 }}>
                        {item.dominio}
                      </span>
                      {item.data && (
                        <span style={{ fontSize:'0.72rem', color:'#aaa' }}>
                          • {item.data}
                        </span>
                      )}
                    </div>

                    <a href={item.url} target="_blank" rel="noopener noreferrer"
                      style={{ 
                        fontSize:'1.05rem', 
                        fontWeight:600, 
                        color:'#1a0dab', 
                        textDecoration:'none', 
                        display:'block', 
                        marginBottom:'8px',
                        lineHeight:1.4
                      }}>
                      {item.titulo}
                    </a>

                    <p style={{ 
                      fontSize:'0.85rem', 
                      color:'#555', 
                      margin:0, 
                      lineHeight:1.6, 
                      display:'-webkit-box', 
                      WebkitLineClamp:3, 
                      WebkitBoxOrient:'vertical', 
                      overflow:'hidden' 
                    }}>
                      {item.descricao}
                    </p>

                    <a href={item.url} target="_blank" rel="noopener noreferrer"
                      style={{ 
                        fontSize:'0.8rem', 
                        color:'#667eea', 
                        textDecoration:'none', 
                        display:'inline-flex', 
                        alignItems:'center', 
                        gap:'4px', 
                        marginTop:'10px',
                        fontWeight:500
                      }}>
                      <ExternalLink size={12} />
                      Visitar site
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Perguntas Relacionadas */}
          {perguntasRelacionadas.length > 0 && (
            <div style={{ marginTop:'24px' }}>
              <h3 style={{ fontSize:'0.95rem', color:'#444', marginBottom:'12px' }}>
                <MessageSquare size={16} color="#764ba2" style={{ marginRight:'8px' }} />
                Perguntas Relacionadas
              </h3>
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                {perguntasRelacionadas.map((item, i) => (
                  <details 
                    key={i} 
                    style={{
                      background:'#fff',
                      borderRadius:'10px',
                      padding:'16px',
                      boxShadow:'0 2px 8px rgba(0,0,0,0.06)',
                      cursor:'pointer'
                    }}>
                    <summary style={{ 
                      fontSize:'0.9rem', 
                      fontWeight:500, 
                      color:'#333',
                      padding:'4px 0',
                      listStyle:'none'
                    }}>
                      {item.question}
                    </summary>
                    <div style={{ marginTop:'12px', paddingLeft:'8px', borderLeft:'3px solid #667eea33' }}>
                      <p style={{ fontSize:'0.85rem', color:'#555', lineHeight:1.6, marginBottom:'8px' }}>
                        {item.answer}
                      </p>
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                          fontSize:'0.8rem', 
                          color:'#667eea', 
                          textDecoration:'none',
                          fontWeight:500
                        }}>
                        Ver mais →
                      </a>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      <style>{`
        @keyframes ml-spin { 
          to { transform: rotate(360deg); } 
        }
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
