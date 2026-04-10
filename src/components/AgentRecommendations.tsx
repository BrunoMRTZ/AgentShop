import { TrendingDown, Sparkles, AlertTriangle, BarChart3 } from 'lucide-react';
import { useAgent } from '../context/AgentContext';

export function AgentRecommendations() {
  const { recommendations, sendMessage } = useAgent();

  const getIcon = (type: string) => {
    switch (type) {
      case 'deal': return <TrendingDown className="w-5 h-5 text-emerald-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'product': return <BarChart3 className="w-5 h-5 text-blue-500" />;
      default: return <Sparkles className="w-5 h-5 text-violet-500" />;
    }
  };

  const getBorderColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-400';
      case 'medium': return 'border-l-amber-400';
      default: return 'border-l-violet-400';
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Insights do Agente</h2>
          <p className="text-xs text-gray-400">Análises em tempo real para suas decisões de compra</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {recommendations.map(rec => (
          <button
            key={rec.id}
            onClick={() => sendMessage(rec.title)}
            className={`text-left bg-white border border-gray-100 border-l-4 ${getBorderColor(rec.priority)} rounded-xl p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all group`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{getIcon(rec.type)}</div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-violet-600 transition-colors">
                  {rec.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{rec.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
