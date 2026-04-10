import React, { createContext, useContext, useState, useCallback } from 'react';
import { AgentMessage, AgentRecommendation } from '../types';

interface AgentContextType {
  messages: AgentMessage[];
  sendMessage: (content: string) => void;
  recommendations: AgentRecommendation[];
  isTyping: boolean;
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
}

const AgentContext = createContext<AgentContextType | null>(null);

const agentResponses: Record<string, { response: string; suggestions?: string[] }> = {
  default: {
    response: 'Olá! Sou seu assistente de compras inteligente. 🤖 Posso ajudar você a encontrar os melhores produtos, comparar preços e identificar ofertas imperdíveis. O que você procura?',
    suggestions: ['Melhores ofertas', 'Recomendações para mim', 'Rastrear preços']
  },
  'melhores ofertas': {
    response: '🔥 Analisando todos os produtos... Encontrei ofertas excepcionais! O **Monitor Gamer 27" 165Hz** está com 24% de desconto — a melhor oferta da semana. O **Fone Bluetooth Pro Max** também está 30% abaixo da média de mercado. Ambos com tendência de alta de preço, então recomendo agir rápido!',
    suggestions: ['Ver Monitor Gamer', 'Ver Fone Bluetooth', 'Comparar produtos']
  },
  'recomendações para mim': {
    response: '🎯 Baseado na análise do seu perfil de navegação e histórico de compras, identifiquei produtos com alta compatibilidade:\n\n• **Notebook Ultra Slim 15"** — Score de personalização: 92%\n• **Fone Bluetooth Pro Max** — Score de personalização: 95%\n• **Teclado Mecânico RGB** — Score de personalização: 82%\n\nEsses produtos combinam com seu perfil de uso profissional e interesse em tecnologia.',
    suggestions: ['Ver Notebook', 'Ver Fone', 'Ver Teclado']
  },
  'rastrear preços': {
    response: '📊 Aqui está o panorama de preços que monitoro:\n\n📈 **Subindo**: Monitor Gamer (+3%/sem), Fone Bluetooth (+2%/sem)\n📉 **Caindo**: Câmera Mirrorless (-1.5%/sem), Tablet Pro (-2%/sem)\n➡️ **Estáveis**: Smartwatch, Notebook, Caixa de Som, Teclado\n\nQuer que eu alerte quando algum produto atingir seu preço ideal?',
    suggestions: ['Alerta de preço', 'Previsão de descontos']
  },
  'alerta de preço': {
    response: '🔔 Sistema de alerta configurado! Posso monitorar qualquer produto e notificá-lo quando:\n\n• O preço cair X%\n• Estiver com estoque baixo\n• Houver cupom disponível\n• O preço estiver no mínimo histórico\n\nBasta me dizer qual produto e qual condição te interessa!',
    suggestions: ['Monitorar Câmera', 'Monitorar Tablet', 'Configurar alertas']
  },
  'previsão de descontos': {
    response: '🔮 Minha análise preditiva indica:\n\n• **Smartwatch Ultra** — 15% de desconto previsto em ~14 dias\n• **Tablet Pro 11"** — 12% previsto em ~7 dias\n• **Câmera Mirrorless** — 10% previsto em ~10 dias\n• **Caixa de Som** — 10% previsto em ~21 dias\n\nQuer que eu adicione algum à sua lista de observação?',
    suggestions: ['Lista de observação', 'Melhores ofertas agora']
  },
  'ver monitor gamer': {
    response: '🖥️ **Monitor Gamer 27" 165Hz** — R$ 1.899,90 (de R$ 2.499,90)\n\n✅ 24% de desconto (economia de R$ 600)\n✅ Score de oferta: 95/100\n✅ Melhor preço dos últimos 30 dias\n⚠️ Estoque baixo — apenas 12 unidades\n📈 Preço tende a subir nos próximos dias\n\n**Recomendação do Agente: COMPRAR AGORA** ⭐',
    suggestions: ['Adicionar ao carrinho', 'Comparar com outros']
  },
  'ver fone bluetooth': {
    response: '🎧 **Fone Bluetooth Pro Max** — R$ 349,90 (de R$ 499,90)\n\n✅ 30% de desconto (economia de R$ 150)\n✅ Score de oferta: 92/100\n✅ Personalização: 95% — combina muito com você!\n⚠️ Estoque baixo\n📈 Preço subindo 2%/semana\n\n**Recomendação do Agente: COMPRAR AGORA** ⭐',
    suggestions: ['Adicionar ao carrinho', 'Ver detalhes completos']
  },
  'ver notebook': {
    response: '💻 **Notebook Ultra Slim 15"** — R$ 3.999,90 (de R$ 4.799,90)\n\n✅ 17% de desconto (economia de R$ 800)\n✅ Score de oferta: 88/100\n✅ Personalização: 92%\n✅ Estoque disponível\n➡️ Preço estável — boa hora para comprar\n\n**Recomendação do Agente: BOA OPORTUNIDADE** 👍',
    suggestions: ['Adicionar ao carrinho', 'Ver especificações']
  },
  'ver teclado': {
    response: '⌨️ **Teclado Mecânico RGB** — R$ 449,90 (de R$ 599,90)\n\n✅ 25% de desconto\n✅ Score de oferta: 80/100\n✅ Personalização: 82%\n✅ Estoque disponível\n➡️ Preço estável\n\n**Recomendação do Agente: BOA COMPRA** 👍',
    suggestions: ['Adicionar ao carrinho', 'Ver mais periféricos']
  }
};

function getAgentResponse(input: string): { response: string; suggestions?: string[] } {
  const lower = input.toLowerCase().trim();
  for (const [key, value] of Object.entries(agentResponses)) {
    if (key !== 'default' && lower.includes(key)) {
      return value;
    }
  }
  // Smart matching
  if (lower.includes('oferta') || lower.includes('desconto') || lower.includes('promo')) {
    return agentResponses['melhores ofertas'];
  }
  if (lower.includes('recomend') || lower.includes('sugest') || lower.includes('perfil')) {
    return agentResponses['recomendações para mim'];
  }
  if (lower.includes('preço') || lower.includes('monitor') || lower.includes('rastrear')) {
    return agentResponses['rastrear preços'];
  }
  if (lower.includes('alerta') || lower.includes('notific')) {
    return agentResponses['alerta de preço'];
  }
  if (lower.includes('previsão') || lower.includes('prever') || lower.includes('futuro')) {
    return agentResponses['previsão de descontos'];
  }
  if (lower.includes('carrinho')) {
    return {
      response: '🛒 Posso ajudar a otimizar seu carrinho! Meu agente analisa combinações de produtos, aplica descontos automáticos e sugere itens complementares para maximizar seu savings. Quer que eu analise seu carrinho atual?',
      suggestions: ['Otimizar carrinho', 'Melhores ofertas']
    };
  }
  if (lower.includes('obrigad') || lower.includes('valeu')) {
    return {
      response: 'Por nada! 😊 Estou sempre aqui para ajudar você a fazer as melhores compras. Se precisar de alguma análise de preço ou recomendação, é só chamar! Boas compras! 🛍️',
      suggestions: ['Melhores ofertas', 'Recomendações para mim']
    };
  }
  return agentResponses.default;
}

function generateRecommendations(): AgentRecommendation[] {
  return [
    {
      id: '1',
      type: 'deal',
      title: '🔥 Oferta Relâmpago Detectada',
      description: 'Monitor Gamer 27" com 24% de desconto — melhor preço em 30 dias',
      icon: 'deal',
      priority: 'high'
    },
    {
      id: '2',
      type: 'tip',
      title: '💡 Dica do Agente',
      description: 'Fone Bluetooth tem 95% de match com seu perfil de uso',
      icon: 'tip',
      priority: 'medium'
    },
    {
      id: '3',
      type: 'warning',
      title: '⚠️ Estoque Baixo',
      description: 'Monitor Gamer com apenas 12 unidades restantes',
      icon: 'warning',
      priority: 'high'
    },
    {
      id: '4',
      type: 'product',
      title: '📊 Previsão de Preço',
      description: 'Tablet Pro deve cair 12% nos próximos 7 dias',
      icon: 'product',
      priority: 'medium'
    }
  ];
}

export function AgentProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [recommendations] = useState<AgentRecommendation[]>(generateRecommendations());

  const sendMessage = useCallback((content: string) => {
    const userMessage: AgentMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    const agentData = getAgentResponse(content);

    setTimeout(() => {
      const agentMessage: AgentMessage = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: agentData.response,
        timestamp: new Date(),
        suggestions: agentData.suggestions
      };
      setMessages(prev => [...prev, agentMessage]);
      setIsTyping(false);
    }, 1200 + Math.random() * 800);
  }, []);

  return (
    <AgentContext.Provider
      value={{
        messages,
        sendMessage,
        recommendations,
        isTyping,
        chatOpen,
        setChatOpen
      }}
    >
      {children}
    </AgentContext.Provider>
  );
}

export function useAgent() {
  const context = useContext(AgentContext);
  if (!context) throw new Error('useAgent must be used within AgentProvider');
  return context;
}
