import { useState, useEffect } from 'react';
import { Bot, Search, BrainCircuit, Globe, SlidersHorizontal, CheckCircle2, ChevronRight, X, Loader2 } from 'lucide-react';

interface ProfileCalibrationProps {
  isOpen: boolean;
  onClose: () => void;
  onCalibrateComplete?: (query: string) => void;
}

export function ProfileCalibration({ isOpen, onClose, onCalibrateComplete }: ProfileCalibrationProps) {
  const [step, setStep] = useState<'input' | 'thinking' | 'results'>('input');
  const [interest, setInterest] = useState('');
  const [thoughtIndex, setThoughtIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setStep('input');
      setInterest('');
      setThoughtIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const thoughts = [
    { text: "Ativando modelo de linguagem interno...", icon: <Bot className="w-5 h-5" /> },
    { text: "Realizando web search semântico sobre seu termo...", icon: <Globe className="w-5 h-5" /> },
    { text: "Cruzando reviews do YouTube e opiniões no Reddit...", icon: <Search className="w-5 h-5" /> },
    { text: "Extraindo características chave: Durabilidade vs Preço", icon: <BrainCircuit className="w-5 h-5" /> },
    { text: "Calibrando algorítmos do seu perfil de recomendação espacial...", icon: <SlidersHorizontal className="w-5 h-5" /> },
  ];

  const handleStartCalibration = () => {
    if (!interest.trim()) return;
    setStep('thinking');
    
    let currentThought = 0;
    const interval = setInterval(() => {
      currentThought++;
      if (currentThought < thoughts.length) {
        setThoughtIndex(currentThought);
      } else {
         clearInterval(interval);
         setTimeout(() => setStep('results'), 1500);
      }
    }, 2500);
  };

  const handleSaveAndRender = () => {
    const t = interest.toLowerCase();
    let query = '';
    
    if (t.includes('câmera') || t.includes('noturna') || t.includes('foto') || t.includes('celular') || t.includes('iphone') || t.includes('smart')) {
      query = 'iphone';
    } else if (t.includes('jogo') || t.includes('play') || t.includes('game') || t.includes('ps5') || t.includes('console')) {
      query = 'playstation';
    } else if (t.includes('notebook') || t.includes('render') || t.includes('edição') || t.includes('trabalho') || t.includes('macbook')) {
      query = 'notebook';
    } else if (t.includes('conforto') || t.includes('fone') || t.includes('música') || t.includes('audio') || t.includes('som')) {
      query = 'fone';
    } else if (t.includes('tv') || t.includes('filme') || t.includes('série') || t.includes('assistir') || t.includes('vídeo')) {
      query = 'tv';
    } else if (t.includes('echo') || t.includes('alexa') || t.includes('casa')) {
      query = 'echo';
    } else {
      query = interest.split(' ').find(w => w.length > 3) || '';
    }

    if (onCalibrateComplete) {
      onCalibrateComplete(query);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-8">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-3xl bg-white shadow-2xl rounded-3xl flex flex-col md:flex-row overflow-hidden animate-slide-in min-h-[500px]">
        
        {/* Painel Esquerdo: Agente Visual */}
        <div className="w-full md:w-5/12 bg-gradient-to-br from-slate-900 via-violet-900 to-indigo-950 p-8 flex flex-col justify-between text-white relative overflow-hidden shrink-0">
           {/* Background Decorations */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
           <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2"></div>
           
           <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl flex items-center justify-center shadow-lg mb-6">
                <BrainCircuit className="w-6 h-6 text-violet-300" />
              </div>
              <h2 className="text-3xl font-black text-white leading-tight">
                Deep Calibration
              </h2>
              <p className="text-violet-200 mt-3 text-sm leading-relaxed">
                Nossos agentes autônomos pesquisam na internet inteira para entender as nuances do que você busca no momento.
              </p>
           </div>
           
           <div className="relative z-10 hidden md:block">
             <div className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
               <div className="flex items-center gap-2 mb-2">
                 <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                 <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Agents Online</span>
               </div>
               <p className="text-[11px] text-gray-300">Conectado a 140+ fontes de review, benchmarks de performance e metadados logísticos globais.</p>
             </div>
           </div>
        </div>

        {/* Painel Direito: Conteúdo Interativo */}
        <div className="w-full md:w-7/12 bg-gray-50 p-6 sm:p-10 flex flex-col relative overflow-y-auto">
           <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 hover:bg-gray-100 transition z-50">
             <X className="w-4 h-4" />
           </button>

           {step === 'input' && (
             <div className="flex-1 flex flex-col justify-center animate-fade-in space-y-6 max-w-sm mx-auto w-full">
               <div className="text-center">
                 <Bot className="w-12 h-12 text-violet-600 mx-auto mb-4" />
                 <h3 className="text-2xl font-bold text-gray-900 mb-2">O que você busca hoje?</h3>
                 <p className="text-sm text-gray-500">Descreva sua próxima compra ou interesse, e eu pesquisarei na web para modelar recomendações exatas.</p>
               </div>
               
               <div className="space-y-4">
                 <textarea 
                   rows={4}
                   value={interest}
                   onChange={e => setInterest(e.target.value)}
                   className="w-full px-4 py-3 bg-white border-2 border-transparent shadow-sm focus:border-violet-500 rounded-xl resize-none transition-all outline-none text-sm text-gray-800"
                   placeholder="Ex: Estou procurando um notebook bom para edição de vídeo com render pesado, mas não quero gastar mais de R$ 6.000."
                 ></textarea>
                 
                 <div className="flex flex-wrap gap-2 justify-center">
                   <span onClick={() => setInterest("Smartphones com a melhor câmera para fotos noturnas")} className="text-[10px] bg-violet-100 hover:bg-violet-200 text-violet-700 px-3 py-1.5 rounded-full cursor-pointer font-bold transition">📸 Câmera Noturna</span>
                   <span onClick={() => setInterest("Cadeira ergonômica focada em suporte para a lombar durante 12h de trabalho")} className="text-[10px] bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-1.5 rounded-full cursor-pointer font-bold transition">🪑 Conforto Lombar</span>
                 </div>
               </div>

               <button 
                 onClick={handleStartCalibration}
                 disabled={!interest.trim()}
                 className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-900/20 disabled:opacity-50 disabled:cursor-not-allowed group flex gap-2 justify-center items-center"
               >
                 Acionar Agente de Pesquisa <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </button>
             </div>
           )}

           {step === 'thinking' && (
             <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full py-8">
               <div className="relative mb-12 flex justify-center">
                  <div className="absolute inset-0 bg-violet-200 rounded-full blur-xl animate-pulse"></div>
                  <div className="w-20 h-20 bg-white shadow-xl rounded-full flex items-center justify-center relative z-10 border border-violet-100">
                    <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
                  </div>
               </div>

               <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[1.15rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gray-200">
                 {thoughts.map((thought, idx) => {
                   const isActive = idx === thoughtIndex;
                   const isPast = idx < thoughtIndex;
                   
                   return (
                     <div key={idx} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group transition-all duration-700 ${idx > thoughtIndex ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'} ${isActive ? 'scale-105' : 'scale-100'}`}>
                        <div className={`flex items-center justify-center w-9 h-9 rounded-full border-[3px] border-white shadow-sm z-10 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-colors duration-500 ${isPast ? 'bg-emerald-500 text-white' : isActive ? 'bg-violet-600 text-white shadow-violet-500/40' : 'bg-gray-200 text-gray-400'}`}>
                          {isPast ? <CheckCircle2 className="w-5 h-5" /> : thought.icon}
                        </div>
                        <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] bg-white p-3 rounded-xl border border-gray-100 shadow-sm transition-opacity">
                          <p className={`text-xs sm:text-sm font-semibold leading-snug ${isPast ? 'text-gray-500' : 'text-gray-900'}`}>
                             {thought.text}
                          </p>
                        </div>
                     </div>
                   );
                 })}
               </div>
             </div>
           )}

           {step === 'results' && (
             <div className="flex-1 flex flex-col justify-center animate-fade-in w-full text-left">
               <div className="mb-6 flex gap-4 items-center">
                 <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                 </div>
                 <div>
                    <h3 className="text-xl font-bold text-gray-900">Mapeamento Concluído!</h3>
                    <p className="text-sm text-gray-500 mt-0.5">O Agente extraiu as características exigidas para sua pesquisa.</p>
                 </div>
               </div>
               
               <div className="bg-white rounded-2xl border border-violet-100 p-5 shadow-sm space-y-5 mb-8 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-violet-500 to-indigo-500"></div>
                 
                 <div>
                    <div className="flex justify-between text-xs font-bold text-gray-700 mb-1.5 px-0.5 uppercase tracking-wide">
                      <span>Performance Exigida</span>
                      <span className="text-violet-600">Alta (88%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-violet-600 h-full rounded-full w-[88%] animate-[width_1.5s_ease-out]"></div>
                    </div>
                 </div>

                 <div>
                    <div className="flex justify-between text-xs font-bold text-gray-700 mb-1.5 px-0.5 uppercase tracking-wide">
                      <span>Qualidade de Construção / Acabamento</span>
                      <span className="text-indigo-600">Premium (95%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full w-[95%] animate-[width_1.2s_ease-out]"></div>
                    </div>
                 </div>

                 <div>
                    <div className="flex justify-between text-xs font-bold text-gray-700 mb-1.5 px-0.5 uppercase tracking-wide">
                      <span>Custo-Benefício na Categoria</span>
                      <span className="text-blue-500">Equilibrado (60%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full w-[60%] animate-[width_1s_ease-out]"></div>
                    </div>
                 </div>
                 
                 <div className="bg-gray-50 p-4 rounded-xl text-xs text-gray-600 mt-2 flex gap-3 border border-gray-100">
                    <BrainCircuit className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
                    <p>O Agente compreendeu internamente que você abre mão de um design minimalista contanto que entregue <strong>robustez mecânica</strong> e seja avaliado em fóruns entusiastas como duradouro.</p>
                 </div>
               </div>

               <button 
                 onClick={handleSaveAndRender}
                 className="w-full bg-violet-600 text-white font-bold py-3.5 rounded-xl hover:bg-violet-700 transition shadow-lg flex justify-center items-center gap-2"
               >
                 Salvar Score e Renderizar Produtos Mapeados <CheckCircle2 className="w-4 h-4" />
               </button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
