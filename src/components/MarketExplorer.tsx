import { useState, useEffect, useRef } from 'react';
import { X, Loader2, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Product } from '../types';

// ─── Config ScrapingBee ───────────────────────────────────────────────────────

const SCRAPINGBEE_KEY = 'PYNH3MAHGQ1D44HT83NQX0G5D9SSI3MH4PDTPHQWPPQAK392QXFXEHTHUEWNUOCNUVKHY7WCCDGPDGBG';
const SCRAPINGBEE_URL = 'https://app.scrapingbee.com/api/v1/google';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface MarketExplorerProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

// Formato retornado pela ScrapingBee Google Shopping
interface ShoppingResult {
  name?: string;
  title?: string;
  price?: string | number;
  extracted_price?: number;
  old_price?: string | number;
  rating?: number;
  reviews?: number;
  reviews_count?: number;
  thumbnail?: string;
  image?: string;
  link?: string;
  source?: string;
  delivery?: string;
  tag?: string;
  shipping?: string;
  shipping_cost?: string;
  free_shipping?: boolean;
}

interface MLItem {
  nome: string;
  preco: string | null;
  precoAnterior: string | null;
  desconto: string | null;
  parcelas: string | null;
  freight: string | null;
  imagem: string | null;
  link: string;
  avaliacao: string | null;
  loja: string | null;
  reviews?: number;
}

type SortType = 'padrao' | 'avaliacao' | 'menor-preco' | 'maior-desconto';

// ─── Busca via ScrapingBee Google Shopping ────────────────────────────────────

async function buscarScrapingBee(busca: string): Promise<MLItem[]> {
  const params = new URLSearchParams({
    api_key:     SCRAPINGBEE_KEY,
    search:      busca,
    search_type: 'shopping',
    country_code: 'br',
  });

  const res = await fetch(`${SCRAPINGBEE_URL}?${params.toString()}`);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`ScrapingBee HTTP ${res.status}: ${txt.slice(0, 200)}`);
  }

  const data = await res.json();
  console.log('ScrapingBee response:', data);

  // Tenta diferentes caminhos para os resultados
  const raw: ShoppingResult[] = data.shopping_results
    ?? data.organic_results
    ?? data.results
    ?? data.products
    ?? [];

  console.log('Raw items count:', raw.length);
  if (raw.length > 0) {
    console.log('First item keys:', Object.keys(raw[0]));
  }

  return raw.map((item): MLItem => {
    const priceRaw = item.extracted_price ?? item.price;
    const price    = typeof priceRaw === 'number'
      ? priceRaw
      : parseFloat(String(priceRaw ?? '').replace(/[^\d,\.]/g, '').replace(',', '.')) || 0;

    const oldRaw  = item.old_price;
    const oldPrice = typeof oldRaw === 'number'
      ? oldRaw
      : parseFloat(String(oldRaw ?? '').replace(/[^\d,\.]/g, '').replace(',', '.')) || 0;

    const disc = oldPrice > price && oldPrice > 0
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : 0;

    return {
      nome:          String(item.name ?? item.title ?? ''),
      preco:         price > 0 ? `R$ ${price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00',
      precoAnterior: oldPrice > price ? oldPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : null,
      desconto:      disc > 0 ? `${disc}% OFF` : null,
      parcelas:      null,
      // Frete: tenta múltiplos campos que a API pode retornar
      freight:      item.free_shipping ? 'Frete Grátis' : (item.shipping ?? item.delivery ?? item.tag ?? null),
      imagem:        item.thumbnail ?? item.image ?? null,
      link:          item.link ?? '#',
      avaliacao:     item.rating ? String(item.rating.toFixed(1)) : null,
      loja:          item.source ?? null,
      reviews:       item.reviews_count ?? item.reviews ?? 0,
    };
  }).filter(i => i.nome);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function precoNum(p: MLItem): number {
  if (!p.preco) return 0;
  return parseFloat(p.preco.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
}

function descNum(p: MLItem): number {
  if (!p.desconto) return 0;
  return parseFloat(p.desconto.replace(/[^\d]/g, '')) || 0;
}

function applySorted(tipo: SortType, base: MLItem[]): MLItem[] {
  const c = [...base];
  if (tipo === 'avaliacao')      c.sort((a, b) => parseFloat(b.avaliacao || '0') - parseFloat(a.avaliacao || '0'));
  if (tipo === 'menor-preco')    c.sort((a, b) => precoNum(a) - precoNum(b));
  if (tipo === 'maior-desconto') c.sort((a, b) => descNum(b) - descNum(a));
  return c;
}

function toProduct(item: MLItem, index: number): Product {
  const price = precoNum(item);
  const orig  = item.precoAnterior
    ? parseFloat(item.precoAnterior.replace(/\./g, '').replace(',', '.')) : 0;
  return {
    id: 9000 + index,
    name: item.nome,
    description: [item.loja, item.freight].filter(Boolean).join(' · '),
    price,
    originalPrice: orig > price ? orig : undefined,
    image: item.imagem || '',
    category: 'Google Shopping',
    rating: parseFloat(item.avaliacao || '0') || 0,
    reviews: 0,
    url: item.link,
    agentData: {
      dealScore: Math.min(99, 60 + descNum(item)),
      priceTrend: descNum(item) > 10 ? 'down' : 'stable',
      predictedDiscount: 0,
      personalizationScore: 75,
      stockLevel: 'high',
      similarProducts: [],
      aiSummary: '',
    },
  };
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function MarketExplorer({ isOpen, onClose, initialQuery = '' }: MarketExplorerProps) {
  const { addToCart } = useCart();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query,    setQuery]    = useState(initialQuery);
  const [todos,    setTodos]    = useState<MLItem[]>([]);
  const [lista,    setLista]    = useState<MLItem[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [status,   setStatus]   = useState('');
  const [erro,     setErro]     = useState('');
  const [sort,     setSort]     = useState<SortType>('padrao');
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());

  function handleSort(tipo: SortType) {
    setSort(tipo);
    setLista(applySorted(tipo, todos));
  }

  async function buscar(termo = query) {
    if (!termo.trim()) return;
    setTodos([]); setLista([]); setStatus(''); setErro(''); setSort('padrao');
    setLoading(true);
    try {
      const data = await buscarScrapingBee(termo);
      console.log('ScrapingBee data:', data);
      if (!data.length) { setStatus('Nenhum produto encontrado.'); return; }
      setTodos(data);
      setLista(data);
      setStatus(`${data.length} produto(s) encontrado(s)`);
    } catch (e: any) {
      setErro('Erro ao buscar: ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isOpen && initialQuery) { setQuery(initialQuery); buscar(initialQuery); }
  }, [isOpen, initialQuery]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  function handleAdd(item: MLItem, i: number) {
    const p = toProduct(item, i);
    addToCart(p);
    setAddedIds(prev => new Set(prev).add(p.id));
    setTimeout(() => setAddedIds(prev => { const s = new Set(prev); s.delete(p.id); return s; }), 2000);
  }

  if (!isOpen) return null;

  const sortOpts: { key: SortType; label: string }[] = [
    { key: 'padrao',         label: 'Padrão' },
    { key: 'avaliacao',      label: '⭐ Maior avaliação' },
    { key: 'menor-preco',    label: '💰 Menor preço' },
    { key: 'maior-desconto', label: '🔥 Maior desconto' },
  ];

  return (
    <div style={{ position:'fixed', inset:0, zIndex:99999, background:'rgba(15,23,42,0.78)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }}>
      <div style={{ width:'100%', maxWidth:'1100px', height:'90vh', background:'#f5f5f5', borderRadius:'16px', overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 25px 60px rgba(0,0,0,0.4)' }}>

        {/* Header */}
        <header style={{ background:'#ffe600', padding:'13px 20px', display:'flex', alignItems:'center', gap:'12px', flexShrink:0 }}>
          <h1 style={{ fontSize:'1.05rem', color:'#333', whiteSpace:'nowrap', margin:0 }}>🛒 Google Shopping</h1>
          <div style={{ display:'flex', gap:'8px', flex:1, maxWidth:'600px' }}>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && buscar()}
              placeholder="Buscar produto..."
              style={{ flex:1, padding:'9px 14px', border:'none', borderRadius:'4px', fontSize:'0.93rem', outline:'none' }}
            />
            <button onClick={() => buscar()} disabled={loading}
              style={{ padding:'9px 20px', background:'#333', color:'#ffe600', border:'none', borderRadius:'4px', fontSize:'0.93rem', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px', opacity: loading ? 0.6 : 1 }}>
              {loading && <Loader2 size={14} className="animate-spin" />}
              Buscar
            </button>
          </div>
          <button onClick={onClose}
            style={{ marginLeft:'auto', background:'rgba(0,0,0,0.12)', border:'none', borderRadius:'50%', width:'32px', height:'32px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <X size={16} color="#333" />
          </button>
        </header>

        {/* Toolbar ordenação */}
        {todos.length > 0 && (
          <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'9px 20px', background:'#fff', borderBottom:'1px solid #eee', flexWrap:'wrap', flexShrink:0 }}>
            <span style={{ fontSize:'0.8rem', color:'#666' }}>Ordenar por:</span>
            {sortOpts.map(o => (
              <button key={o.key} onClick={() => handleSort(o.key)}
                style={{ padding:'4px 13px', border:`1px solid ${sort===o.key?'#3483fa':'#ccc'}`, borderRadius:'20px', background: sort===o.key?'#3483fa':'#fff', color: sort===o.key?'#fff':'#333', fontSize:'0.78rem', cursor:'pointer' }}>
                {o.label}
              </button>
            ))}
          </div>
        )}

        {/* Conteúdo */}
        <main style={{ flex:1, overflowY:'auto', padding:'20px' }}>

          {status && <p style={{ marginBottom:'14px', color:'#666', fontSize:'0.86rem' }}>{status}</p>}

          {loading && (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'60%', gap:'12px' }}>
              <div style={{ width:'36px', height:'36px', border:'4px solid #ddd', borderTopColor:'#3483fa', borderRadius:'50%', animation:'ml-spin 0.7s linear infinite' }} />
              <p style={{ color:'#999', fontSize:'0.85rem' }}>Buscando no Google Shopping...</p>
            </div>
          )}

          {erro && (
            <pre style={{ color:'#e00', background:'#fff0f0', padding:'14px', borderRadius:'6px', fontSize:'0.83rem', whiteSpace:'pre-wrap' }}>{erro}</pre>
          )}

          {!loading && !erro && !status && (
            <div style={{ textAlign:'center', marginTop:'80px', color:'#bbb' }}>
              <p style={{ fontSize:'2.5rem' }}>🛒</p>
              <p style={{ marginTop:'8px', fontSize:'0.9rem' }}>Digite algo para buscar no Google Shopping</p>
              <p style={{ fontSize:'0.75rem', color:'#999', marginTop:'4px' }}>Abra o console (F12) para ver o JSON retornado</p>
            </div>
          )}

          {/* Grid */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:'16px' }}>
            {lista.map((p, i) => {
              const pid   = 9000 + i;
              const added = addedIds.has(pid);
              return (
                <div key={i}
                  style={{ background:'#fff', borderRadius:'8px', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.1)', display:'flex', flexDirection:'column', transition:'box-shadow 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.1)')}>

                  {p.imagem && (
                    <img src={p.imagem} alt={p.nome} loading="lazy"
                      style={{ width:'100%', aspectRatio:'1', objectFit:'contain', background:'#f9f9f9', padding:'8px' }}
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  )}

                  <div style={{ padding:'12px', display:'flex', flexDirection:'column', gap:'4px', flex:1 }}>
                    <span style={{ fontSize:'0.82rem', fontWeight:600, lineHeight:1.3, flex:1 }}>{p.nome}</span>

                    {p.loja && (
                      <span style={{ fontSize:'0.7rem', color:'#3483fa', fontWeight:600 }}>{p.loja}</span>
                    )}
                    {p.avaliacao !== null && (
                      <span style={{ fontSize:'0.75rem', color:'#888' }}>
                        <span style={{ color:'#f5a623' }}>★</span> {p.avaliacao}
                        {p.reviews && <span style={{ color:'#999' }}> ({p.reviews.toLocaleString('pt-BR')})</span>}
                      </span>
                    )}
                    {p.precoAnterior !== null && (
                      <span style={{ fontSize:'0.75rem', color:'#999', textDecoration:'line-through' }}>R$ {p.precoAnterior}</span>
                    )}
                    {p.preco !== null && (
                      <span style={{ fontSize:'1.1rem', color:'#333', fontWeight:700 }}>{p.preco}</span>
                    )}
                    {p.desconto !== null && (
                      <span style={{ display:'inline-block', fontSize:'0.72rem', fontWeight:700, background:'#e6f7ef', color:'#00a650', padding:'2px 6px', borderRadius:'4px', width:'fit-content' }}>{p.desconto}</span>
                    )}
                    {p.parcelas !== null && (
                      <span style={{ fontSize:'0.75rem', color:'#00a650' }}>{p.parcelas}</span>
                    )}
                    {p.freight !== null && (
                      <span style={{ fontSize:'0.75rem', color:'#00a650', fontWeight:600 }}>🚚 {p.freight}</span>
                    )}

                    {/* Debug: JSON completo do item */}
                    <details style={{ marginTop:'4px' }}>
                      <summary style={{ fontSize:'0.65rem', color:'#aaa', cursor:'pointer', userSelect:'none' }}>
                        ver dados brutos
                      </summary>
                      <pre style={{ fontSize:'0.6rem', color:'#555', background:'#f5f5f5', padding:'6px', borderRadius:'4px', whiteSpace:'pre-wrap', wordBreak:'break-all', marginTop:'4px', maxHeight:'120px', overflowY:'auto' }}>
                        {JSON.stringify(p, null, 2)}
                      </pre>
                    </details>

                    <div style={{ display:'flex', gap:'6px', marginTop:'8px' }}>
                      <button onClick={() => handleAdd(p, i)}
                        style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'5px', padding:'7px', background: added ? '#00a650' : '#333', color: added ? '#fff' : '#ffe600', border:'none', borderRadius:'4px', fontSize:'0.77rem', fontWeight:700, cursor:'pointer' }}>
                        <ShoppingCart size={13} />
                        {added ? 'Adicionado!' : 'Adicionar'}
                      </button>
                      <a href={p.link} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize:'0.75rem', color:'#3483fa', textDecoration:'none', display:'flex', alignItems:'center', padding:'7px 8px', border:'1px solid #3483fa33', borderRadius:'4px' }}>
                        Ver →
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      <style>{`@keyframes ml-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
