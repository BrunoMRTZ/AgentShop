import { useState } from 'react';
import { Brain, BarChart3, Shield, Clock, DollarSign, Target, X, CheckCircle2, ChevronRight, Activity } from 'lucide-react';

const features = [
  {
    id: 'assistente',
    icon: <Brain className="w-6 h-6" />,
    title: 'Assistente IA 24/7',
    description: 'Agente inteligente que entende suas necessidades e encontra produtos perfeitos',
    details: {
      subtitle: 'Seu Personal Shopper Autônomo',
      content: 'Nosso agente vai além de simples filtros. Ele interpreta contextos complexos — como "preciso de algo para presentear meu pai que ama café" — varre a internet buscando reviews globais, unifica ofertas e monta cestas personalizadas. O modelo aprende iterativamente e processa a intenção de compra antes mesmo de você finalizar a busca.',
      bullets: [
        'Interação por linguagem natural (PNL).',
        'Leitura simultânea de milhares de reviews para atestar qualidade.',
        'Análise de compatibilidade do produto com perfil do cliente.',
        'Tomada de decisão em tempo real auxiliando o checkout.'
      ],
      metric: 'Economia de 3h de pesquisas por compra'
    }
  },
  {
    id: 'previsao',
    icon: <BarChart3 className="w-6 h-6" />,
    title: 'Previsão de Preços',
    description: 'Algoritmos preditivos que antecipam quedas e altas de preços',
    details: {
      subtitle: 'Compre no Milissegundo Certo',
      content: 'Usando dezenas de variáveis dinâmicas — incluindo comportamento logístico global, variação de fornecedores e padrões históricos temporais — nossos algoritmos preveem o futuro dos preços. A IA lhe diz de antemão se você deve fazer a aquisição agora ou esperar uma semana para ter 20% de desconto.',
      bullets: [
        'Modelos de séries temporais com precisão diária.',
        'Indicadores em tela do padrão de valor em 30 e 90 dias.',
        'Recomendações expressas: "Compre" ou "Aguarde".',
        'Histórico transparente revelando a validade da predição.'
      ],
      metric: '92% de precisão preditiva nas oscilações'
    }
  },
  {
    id: 'carrinho',
    icon: <DollarSign className="w-6 h-6" />,
    title: 'Otimização de Carrinho',
    description: 'Combina cupons, descontos e frete grátis automaticamente',
    details: {
      subtitle: 'O Xeque-Mate no Final da Compra',
      content: 'A Otimização de Carrinho rastreia em milissegundos milhares de combinações no momento de fechar o pedido (Leilões logísticos reversos, cupons ativos no fóruns, desconto por forma de pagamento), enxergando táticas que o ser humano perderia horas verificando e aplica tudo passivamente.',
      bullets: [
        'Testes combinatórios de cupons do marketplace inteiro.',
        'Leilão de fretes envolvendo SEDEX, Loggi e Jadlog simultâneos.',
        'Bolsões de Frete Grátis: Detecção de produtos pequenos extras.',
        'Acompanhamento via simulador interativo na etapa de checkout.'
      ],
      metric: '18% a mais de desconto retido no carrinho'
    }
  },
  {
    id: 'personalizacao',
    icon: <Target className="w-6 h-6" />,
    title: 'Personalização Total',
    description: 'Recomendações baseadas no seu perfil, histórico e comportamento',
    details: {
      subtitle: 'A Loja que adapta ao seu uso',
      content: 'A vitrine inteira da AgentShop renderiza em tempo real baseada em algoritmos neurais focados diretamente nos seus hábitos. Preferências visuais, rejeição algorítmica de marcas não queridas, e priorização natural determinam o que aparece primeiro. Produtos que sofrem alta taxa de devolução para o seu grupo demográfico são varridos.',
      bullets: [
        'Pesos e escores personalizáveis de consumo.',
        'Exclusão autônoma de ofertas de baixo custo-benefício estrito.',
        'Calibração web-search online dos seus interesses base.',
        'Interface modulada de forma unicamente visual para o usuário.'
      ],
      metric: '99% de engajamento no produto exato'
    }
  },
  {
    id: 'protecao',
    icon: <Shield className="w-6 h-6" />,
    title: 'Proteção de Compra',
    description: 'Garantia de menor preço — se cair, devolvemos a diferença',
    details: {
      subtitle: 'Inteligência Logística e Financeira',
      content: 'Garantimos blindagem pós-compra através de análise autônoma de mercado. Se o produto pago sofrer um revés de mercado e decair o valor agressivamente pouco após a sua autorização (ex. Black Friday inesperada), a Proteção de Compra detecta e credita essa depreciação diretamente nas suas reservas automaticamente.',
      bullets: [
        'Tracking assíncrono durante todo o tempo de expedição.',
        'Fundo de reparo alimentado via margens logísticas extras.',
        'Convergência segura via PIX Inteligente no momento da diferença.',
        'Notificação ativa: "Seu agente assegurou o menor preço."'
      ],
      metric: '100% de satisfação blindada'
    }
  },
  {
    id: 'alertas',
    icon: <Clock className="w-6 h-6" />,
    title: 'Alertas Inteligentes',
    description: 'Notificações no momento exato para você não perder ofertas',
    details: {
      subtitle: 'O Vigilante Instantâneo',
      content: 'Lógica condicional aplicada nativamente nas suas vontades de compra de longo prazo. Em vez de span generalizado, nós permitimos que construa radares complexos, como: "Avise-me quando o Teclado Mecânico tiver queda de 30% e estiver coberto por frete via Correios PAC". Quando os scripts web fecham a malha, você é avisado.',
      bullets: [
        {
          title: 'Gatilhos booleanos de alta complexidade formados numa frase.',
          desc: 'O cliente dita a regra (Ex: "Avise-me quando o teclado atingir R$ 300 MAS apenas se houver opção de Frete Grátis SEDEX"). O Agente traduz a sentença natural num micro-script (IF/AND/NOT) condicional de alta execução.'
        },
        {
          title: 'Revezamento autônomo e varreduras cronometradas.',
          desc: 'Para furar bloqueios anti-bot, nós instanciamos clusters invisíveis de micro-agentes que revezam as buscas em milhares de catálogos silenciosamente, conferindo variações de milissegundos.'
        },
        {
          title: 'Baixo assédio. Push Notification via web sem poluição de caixa de entrada.',
          desc: 'O compromisso do Agente é com a paz do cliente. Sem spam em e-mails promocionais inativos. Quando a condição se torna realidade, um alerta flutuante de Web Push pontual surge na sua tela, morrendo logo após sua ação.'
        },
        {
          title: 'Monitoramento de rupturas de estoque em itens desejados.',
          desc: 'Para ofertas raras, os agentes varrem as devoluções noturnas. Se algum item que você deseja teve seu carrinho abandonado por terceiros em estoque pequeno, nós reservamos instantaneamente e geramos seu aviso.'
        }
      ],
      metric: '< 15ms de latência entre a queda e o alerta'
    }
  }
];

export function AgentFeatures() {
  const [activeFeature, setActiveFeature] = useState<typeof features[0] | null>(null);

  return (
    <section className="bg-gradient-to-b from-white to-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-100 text-violet-700 rounded-full text-xs font-semibold mb-4">
            <Brain className="w-3.5 h-3.5" />
            AGENTIC RETAIL
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Como nossos{' '}
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              agentes de IA
            </span>{' '}
            funcionam
          </h2>
          <p className="text-gray-500 mt-3 max-w-lg mx-auto">
            Tecnologia autônoma que transforma a experiência de compra em algo inteligente e personalizado
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={feature.id}
              onClick={() => setActiveFeature(feature)}
              className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-violet-300 hover:shadow-xl hover:shadow-violet-500/10 transition-all hover:-translate-y-1 cursor-pointer flex flex-col h-full"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-violet-50 to-indigo-50 text-violet-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-gradient-to-br group-hover:from-violet-600 group-hover:to-indigo-600 group-hover:text-white transition-all">
                {feature.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-2 group-hover:text-violet-700 transition-colors">{feature.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1">{feature.description}</p>

              <div className="flex items-center gap-2 text-violet-600 text-xs font-bold uppercase tracking-wider group-hover:text-indigo-600 mt-auto pt-4 border-t border-gray-50">
                Ler documentação <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Detail Modal */}
      {activeFeature && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setActiveFeature(null)} />

          <div className="relative w-full max-w-4xl bg-white shadow-2xl rounded-3xl flex flex-col md:flex-row overflow-hidden animate-slide-in max-h-[90vh]">
            <button onClick={() => setActiveFeature(null)} className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-slate-100/50 hover:bg-slate-200 text-slate-600 transition z-50">
              <X className="w-5 h-5" />
            </button>

            {/* Banner Lado Esquerdo */}
            <div className="w-full md:w-5/12 bg-gray-900 flex flex-col relative overflow-hidden shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-transparent to-indigo-600/40 mix-blend-overlay"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>

              <div className="relative z-10 p-8 sm:p-10 h-full flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-2xl flex items-center justify-center shadow-lg mb-6">
                    {activeFeature.icon}
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                    {activeFeature.title}
                  </h2>
                  <p className="text-violet-200 uppercase tracking-widest text-xs font-bold mt-4 opacity-80">
                    Framework AgentShop
                  </p>
                </div>

                <div className="mt-12 bg-white/10 border border-white/10 rounded-xl p-5 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <Activity className="w-5 h-5 text-emerald-400" />
                    <span className="text-white font-bold text-sm">Métrica Comprovada</span>
                  </div>
                  <p className="text-lg text-emerald-300 font-medium">
                    {activeFeature.details.metric}
                  </p>
                </div>
              </div>
            </div>

            {/* Ficha Lado Direito */}
            <div className="w-full md:w-7/12 bg-white p-6 sm:p-10 overflow-y-auto">
              <div className="prose prose-violet max-w-none">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  {activeFeature.details.subtitle}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-8 text-base">
                  {activeFeature.details.content}
                </p>

                <h4 className="font-bold text-gray-900 uppercase tracking-wider text-xs mb-4">Arquitetura de Atuação</h4>
                <div className="space-y-4">
                  {activeFeature.details.bullets.map((bullet: any, idx) => {
                    const isObj = typeof bullet === 'object';
                    const title = isObj ? bullet.title : bullet;
                    const desc = isObj ? bullet.desc : null;

                    return (
                      <div key={idx} className="flex gap-3 items-start">
                        <CheckCircle2 className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
                        <div>
                          <span className={`text-sm ${desc ? 'text-gray-900 font-bold' : 'text-gray-700 font-medium'}`}>{title}</span>
                          {desc && <p className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-gray-100 flex gap-4">
                <button onClick={() => setActiveFeature(null)} className="flex-1 bg-violet-600 text-white font-bold py-3.5 rounded-xl hover:bg-violet-700 transition shadow-lg shadow-violet-600/20">
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
