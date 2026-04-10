import { Product } from '../types';

export const products: Product[] = [
  {
    id: 101,
    name: 'Apple iPhone 15 Pro Max (256 GB) - Titânio natural',
    description: 'Vendido no Mercado Livre (Loja Oficial Apple). Condição: Novo. Envios por Mercado Envios Full.',
    price: 8499.00,
    originalPrice: 9299.00,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=500&q=80',
    category: 'Mercado Livre',
    rating: 4.9,
    reviews: 12450,
    agentData: {
      dealScore: 92,
      priceTrend: 'down',
      predictedDiscount: 5,
      personalizationScore: 95,
      stockLevel: 'high',
      similarProducts: [102, 107],
      aiSummary: 'Agente detectou 8% de desconto direto na loja oficial hoje. Top #1 mais vendido da categoria Smarthphones.'
    }
  },
  {
    id: 102,
    name: 'Console PlayStation 5 Sony (Edição Digital) + 1 Controle',
    description: 'Vendido por Mercado Livre Eletrônicos. Condição: Novo. Despacho direto do fulfillment.',
    price: 3699.90,
    originalPrice: 4299.90,
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=500&q=80',
    category: 'Mercado Livre',
    rating: 4.8,
    reviews: 8432,
    agentData: {
      dealScore: 95,
      priceTrend: 'down',
      predictedDiscount: 0,
      personalizationScore: 88,
      stockLevel: 'medium',
      similarProducts: [101],
      aiSummary: 'Oportunidade Quente. O preço caiu 13% em relação à semana passada e está no ranque de maiores lances de hoje.'
    }
  },
  {
    id: 103,
    name: 'Smart TV 55" 4K UHD Samsung Cu8000',
    description: 'Vendido no Mercado Livre. Condição: Novo. Frete Grátis com garantia Samsung.',
    price: 2499.00,
    originalPrice: 2899.00,
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=500&q=80',
    category: 'Eletrônicos',
    rating: 4.7,
    reviews: 5120,
    agentData: {
      dealScore: 85,
      priceTrend: 'stable',
      predictedDiscount: 10,
      personalizationScore: 78,
      stockLevel: 'high',
      similarProducts: [106],
      aiSummary: 'Um dos painéis mais procurados nas tendências de casa inteligente. Preço estável e frete rápido detectado.'
    }
  },
  {
    id: 104,
    name: 'Notebook Gamer Ideapad Gaming 3i (RTX 3050)',
    description: 'Vendido por Lenovo Oficial no Mercado Livre. Condição: Novo.',
    price: 4399.00,
    originalPrice: 4999.00,
    image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=500&q=80',
    category: 'Computadores',
    rating: 4.6,
    reviews: 2180,
    agentData: {
      dealScore: 88,
      priceTrend: 'down',
      predictedDiscount: 5,
      personalizationScore: 92,
      stockLevel: 'medium',
      similarProducts: [105, 102],
      aiSummary: 'Baseado na sua última busca, esse modelo processa 60 FPS na maioria dos jogos atuais. Ótima faixa de aquisição.'
    }
  },
  {
    id: 105,
    name: 'MacBook Air M1 13" Apple (256 GB SSD, 8GB RAM)',
    description: 'Vendido e entregue por Mercado Livre.',
    price: 5999.00,
    originalPrice: 7299.00,
    image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=500&q=80',
    category: 'Computadores',
    rating: 4.9,
    reviews: 1459,
    agentData: {
      dealScore: 98,
      priceTrend: 'stable',
      predictedDiscount: 0,
      personalizationScore: 85,
      stockLevel: 'low',
      similarProducts: [104],
      aiSummary: 'Corte agressivo de 17% identificado pelo seu agente. Poucas unidades restando no galpão.'
    }
  },
  {
    id: 106,
    name: 'Amazon Echo Dot 5ª Geração Smart Speaker Com Alexa',
    description: 'Vendido no Mercado Livre. Mais vendidos de Áudio Inteligente.',
    price: 314.10,
    originalPrice: 429.00,
    image: 'https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&w=500&q=80',
    category: 'Áudio',
    rating: 4.8,
    reviews: 32000,
    agentData: {
      dealScore: 90,
      priceTrend: 'stable',
      predictedDiscount: 5,
      personalizationScore: 70,
      stockLevel: 'high',
      similarProducts: [103],
      aiSummary: 'Item listado nas tendências diárias do site. Compatível com os eletrodomésticos que você favoritou.'
    }
  },
  {
    id: 107,
    name: 'Samsung Galaxy S23 Ultra (512 GB) - Phantom Black',
    description: 'Vendido por Mercado Livre Eletrônicos. Condição: Novo.',
    price: 5299.00,
    originalPrice: 6599.00,
    image: 'https://images.unsplash.com/photo-1678287515437-0cfd66dd4fe7?auto=format&fit=crop&w=500&q=80',
    category: 'Mercado Livre',
    rating: 4.8,
    reviews: 4325,
    agentData: {
      dealScore: 86,
      priceTrend: 'down',
      predictedDiscount: 10,
      personalizationScore: 82,
      stockLevel: 'medium',
      similarProducts: [101],
      aiSummary: 'A queda de 19% deste aparelho acaba de ser notificada via Push no radar. Hora certa de trocar o smartphone.'
    }
  },
  {
    id: 108,
    name: 'Headphone Fone de Ouvido Edifier W820NB Plus ANC',
    description: 'Vendido e garantido pelo Mercado Livre. Loja Edifier Oficial.',
    price: 369.90,
    originalPrice: 599.00,
    image: 'https://images.unsplash.com/photo-1546435770-a3e426fa99f5?auto=format&fit=crop&w=500&q=80',
    category: 'Áudio',
    rating: 4.7,
    reviews: 2154,
    agentData: {
      dealScore: 94,
      priceTrend: 'stable',
      predictedDiscount: 0,
      personalizationScore: 90,
      stockLevel: 'low',
      similarProducts: [106],
      aiSummary: 'Um dos modelos True Wireless com maior curva de ascensão do mês. Alto custo-benefício validado pela IA.'
    }
  }
];

export const categories = ['Todos', 'Mercado Livre', 'Eletrônicos', 'Computadores', 'Áudio'];
