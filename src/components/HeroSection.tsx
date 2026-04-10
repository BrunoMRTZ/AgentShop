import { ArrowRight, Sparkles, TrendingDown, Shield, Zap } from 'lucide-react';
import { useAgent } from '../context/AgentContext';

export function HeroSection() {
  const { setChatOpen } = useAgent();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-violet-950 to-indigo-950 text-white">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm border border-white/10">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-violet-200">Powered by Agentic AI</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Compras inteligentes com{' '}
              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Agentes de IA
              </span>
            </h1>

            <p className="text-lg text-gray-300 max-w-xl leading-relaxed">
              Nossos agentes autônomos monitoram preços, analisam seu perfil de consumo,
              negociam descontos automaticamente e encontram as melhores ofertas para você —
              em tempo real.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setChatOpen(true)}
                className="group flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-xl font-semibold hover:shadow-xl hover:shadow-violet-500/30 transition-all hover:-translate-y-0.5"
              >
                Falar com o Agente
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href="#products"
                className="flex items-center gap-2 px-6 py-3.5 bg-white/10 backdrop-blur-sm rounded-xl font-semibold border border-white/20 hover:bg-white/20 transition-all"
              >
                Ver Produtos
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-4">
              <div>
                <div className="text-2xl font-bold text-white">98%</div>
                <div className="text-xs text-gray-400">Satisfação IA</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">R$2.4M</div>
                <div className="text-xs text-gray-400">Economizados</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">24/7</div>
                <div className="text-xs text-gray-400">Monitoramento</div>
              </div>
            </div>
          </div>

          {/* Right - Agent Cards */}
          <div className="space-y-4">
            <AgentFeatureCard
              icon={<TrendingDown className="w-5 h-5" />}
              title="Previsão de Preços"
              description="IA prevê quedas de preço e alerta no momento ideal"
              color="from-emerald-500 to-teal-500"
              delay={0}
            />
            <AgentFeatureCard
              icon={<Shield className="w-5 h-5" />}
              title="Proteção de Compra"
              description="Agente monitora e garante o menor preço pós-compra"
              color="from-blue-500 to-cyan-500"
              delay={100}
            />
            <AgentFeatureCard
              icon={<Zap className="w-5 h-5" />}
              title="Otimização Automática"
              description="Combina cupons, cashback e frete grátis automaticamente"
              color="from-amber-500 to-orange-500"
              delay={200}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function AgentFeatureCard({
  icon,
  title,
  description,
  color,
  delay
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  delay: number;
}) {
  return (
    <div
      className="group flex items-start gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all cursor-default"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="text-sm text-gray-400 mt-0.5">{description}</p>
      </div>
    </div>
  );
}
