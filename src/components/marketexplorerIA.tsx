import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Loader2, Code, Sparkles, AlertTriangle, BookOpen, ExternalLink } from 'lucide-react';
import { ShoppingButton } from './ShoppingButton'; // Ajuste o caminho conforme necessário
interface Citation { text: string; urls: string[]; }
interface Link { publisher: string; text: string; url: string; }
interface AIResponse { response_text: string; citations: Citation[]; links: Link[]; }

interface MarketExplorerIAProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export function MarketExplorerIA({ isOpen, onClose, initialQuery = '' }: MarketExplorerIAProps) {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ aiResponse: AIResponse; html: string } | null>(null);
  const [error, setError] = useState('');
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    if (isOpen && initialQuery) {
      handleSearch(initialQuery);
    }
  }, [isOpen, initialQuery]);

  const addLog = (msg: string) => {
    setDebugLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);
    setDebugLogs([]);

    try {
      addLog('Iniciando pesquisas conjuntas: Contexto (Wikipedia) e Ofertas (Bing Shopping) para: ' + searchQuery);

      const proxyBasePath = '/proxy.php';

      // PARTE 1: Resumo explicativo (Texto) via pesquisa normal do Bing
      let infoText = '';
      let infoCitation = null;
      try {
        const urlBingSearch = `https://www.bing.com/shop?q=${encodeURIComponent(searchQuery)}`;
        const proxySearchUrl = `${proxyBasePath}?url=${encodeURIComponent(urlBingSearch)}`;

        addLog('Consultando Bing Search Normal via proxy para obter texto descritivo e contexto...');
        const searchRes = await fetch(proxySearchUrl);
        const searchData = await searchRes.json();

        if (searchData.contents) {
          const sParser = new DOMParser();
          const sDoc = sParser.parseFromString(searchData.contents, 'text/html');

          // O Bing usa '.b_algo p', '.b_caption p' ou '.b_xlText' para os trechos (snippets) descritivos
          const snippetNodes = Array.from(sDoc.querySelectorAll('.b_algo p, .b_caption p, .b_xlText, .rw_rl'));

          for (const node of snippetNodes) {
            const text = node.textContent?.trim() || '';
            // Garante que é um texto encorpado explicativo, de no mínimo 80 caracteres (e descarta os que têm só preço na descrição)
            if (text.length > 80 && text.length < 600 && !text.match(/R\$\s?[\d.,]+/i)) {
              infoText = text;
              const aTag = node.closest('.b_algo')?.querySelector('a');
              if (aTag) {
                const h = aTag.getAttribute('href');
                const t = aTag.textContent?.trim();
                if (h && h.startsWith('http')) {
                  infoCitation = { text: `Fonte do Resumo: ${t || 'Bing Search'}`, urls: [h] };
                }
              }
              break;
            }
          }
          if (infoText) addLog('Descritivo orgânico obtido com sucesso do Bing Search.');
          else addLog('Nenhum descritivo considerável encontrado na busca do Bing.');
        }
      } catch (err: any) {
        addLog(`Ignorado erro da Busca Descritiva: ${err.message}`);
      }

      addLog(`Busca do Algorítmo Orgânico finalizada.`);

      if (!infoText) {
        addLog('Nenhum resultado final útil retornado.');
        setResult({
          aiResponse: {
            response_text: 'A extração não conseguiu encontrar descritivos para esta pesquisa no Bing. Use os logs acima e veja o HTML embutido na página com o botão cinza.',
            citations: [],
            links: []
          },
          html: '' // Mantido vazio pois não há mais parsing completo da tela pesada
        });
        return;
      }

      let finalResponseText = `🧠 **Descritivo (Bing AI):** ${infoText}\n\n`;

      const citationsOut: Citation[] = [];
      if (infoCitation) citationsOut.push(infoCitation as Citation);

      const aiResponse: AIResponse = {
        response_text: finalResponseText,
        citations: citationsOut,
        links: [] // Nenhum link em formato de cartão aqui
      };

      setResult({ aiResponse, html: '' });
      addLog('Layout renderizado com sucesso na tela!');
    } catch (err: any) {
      addLog(`FATAL ERROR CRASH: ${err.message}`);
      if (err.name === 'SyntaxError' || err.message.includes('JSON')) {
        setError('O servidor retornou o arquivo proxy em texto puro em vez de executá-lo. Isso significa que você está rodando o site localmente sem um servidor PHP. Para funcionar, suba os arquivos do build (na pasta dist/) para sua hospedagem Hostinger, pois apenas lá o proxy.php será interpretado!');
      } else {
        setError(err.message || 'Falha ao executar rotina de scraping no Google Shopping.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Adaptação da visualização do código HTML focado na nova rotina
  const handleViewHtml = () => {
    if (!result?.html) return;

    const cleanedHtml = `
      <html>
        <head><title>Scraping Bruto Exibido</title></head>
        <body style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
          <h2>Página Base de Extração:</h2>
          <hr/>
          \${result.html}
        </body>
      </html>
   `;
    const blob = new Blob([cleanedHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };
  const formatResponseText = (text: string) => {
    // Regex explica:
    // (?<=[.?!])\s+  -> Quebra em pontuação final seguida de espaço
    // |              -> OU
    // (?<=\+\d+)     -> Quebra após o sinal de + e os dígitos
    const sentences = text.split(/(?<=[.?!])\s+|(?<=\+\d+)/);

    return sentences.map((sentence, idx) => {
      // Remove espaços extras que podem sobrar no início da frase após o split
      const trimmedSentence = sentence.trim();
      if (!trimmedSentence) return null;

      const colonIndex = trimmedSentence.indexOf(':');
      if (colonIndex !== -1) {
        return (
          <p key={idx} style={{ marginBottom: '12px', lineHeight: '1.6', color: '#444' }}>
            <strong style={{ color: '#111' }}>{trimmedSentence.slice(0, colonIndex + 1)}</strong>
            <br />
            {trimmedSentence.slice(colonIndex + 1)}
          </p>
        );
      }
      return <p key={idx} style={{ marginBottom: '12px', lineHeight: '1.6', color: '#444' }}>{trimmedSentence}</p>;
    });
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px', backdropFilter: 'blur(4px)' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '16px', width: '100%', maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>

        <div style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={24} color="#667eea" />
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#333' }}>Market Explorer IA</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}><X size={24} /></button>
        </div>

        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
            <input ref={inputRef} type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Digite o termo para buscar..." style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }} onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)} />
            <button onClick={() => handleSearch(query)} disabled={loading} style={{ padding: '12px 24px', backgroundColor: '#667eea', color: '#fff', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            </button>
          </div>

          {error && !loading && (
            <div style={{ padding: '16px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', border: '1px solid #f87171', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', marginBottom: '4px' }}>
                <AlertTriangle size={20} /> Falha na Requisição
              </div>
              <div style={{ lineHeight: '1.5' }}>{error}</div>
            </div>
          )}

          {debugLogs.length > 0 && (
            <div style={{ marginBottom: '24px', backgroundColor: '#1e293b', color: '#f8fafc', padding: '16px', borderRadius: '8px', fontSize: '0.85rem', fontFamily: 'monospace', maxHeight: '200px', overflowY: 'auto' }}>
              <strong style={{ color: '#94a3b8', display: 'block', marginBottom: '8px' }}>Terminal de Debug Integrado:</strong>
              {debugLogs.map((log, index) => (
                <div key={index} style={{ marginBottom: '4px', borderBottom: '1px solid #334155', paddingBottom: '2px' }}>{log}</div>
              ))}
            </div>
          )}

          {result && !loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#1e293b' }}>Resposta da IA</h3>
                {formatResponseText(result.aiResponse.response_text)}
              </div>

              {result.aiResponse.citations.length > 0 && (
                <div style={{ padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                  <h4 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#0369a1' }}><BookOpen size={18} /> Citações</h4>
                  {result.aiResponse.citations.map((c, i) => (
                    <div key={i} style={{ marginBottom: '12px' }}>
                      <p style={{ fontSize: '0.9rem', color: '#334155', marginBottom: '4px' }}>{c.text}</p>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {c.urls.map((url, uIdx) => (
                          <a key={uIdx} href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#0369a1', fontSize: '0.8rem', textDecoration: 'underline' }}>Fonte {uIdx + 1}</a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {result.aiResponse.links.length > 0 && (
                <div style={{ padding: '16px', backgroundColor: '#f1f5f9', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <h4 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#475569' }}><ExternalLink size={18} /> Links Relacionados</h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {result.aiResponse.links.map((l, i) => (
                      <li key={i} style={{ marginBottom: '8px' }}>
                        <a href={l.url} target="_blank" rel="noopener noreferrer" style={{ color: '#475569', textDecoration: 'none', fontSize: '0.9rem' }}>
                          <strong>{l.publisher}:</strong> {l.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Seu botão de Shopping */}
              <ShoppingButton query={query} />

              {result.html && (
                <button onClick={handleViewHtml} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer' }}>
                  <Code size={18} /> Ver Código HTML
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes animate-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: animate-spin 1s linear infinite; }
      `}</style>
    </div>
  );
}
