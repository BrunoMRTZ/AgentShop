export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  agentData: {
    dealScore: number; // 0-100
    priceTrend: 'up' | 'down' | 'stable';
    predictedDiscount?: number;
    personalizationScore: number; // 0-100
    stockLevel: 'low' | 'medium' | 'high';
    similarProducts: number[];
    aiSummary: string;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface AgentMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

export interface AgentRecommendation {
  id: string;
  type: 'product' | 'deal' | 'warning' | 'tip';
  title: string;
  description: string;
  productId?: number;
  icon: string;
  priority: 'high' | 'medium' | 'low';
}

export interface AgentInsight {
  label: string;
  value: string;
  trend?: 'up' | 'down' | 'stable';
  icon: string;
}
