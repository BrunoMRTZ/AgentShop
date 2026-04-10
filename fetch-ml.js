const fs = require('fs');

async function fetchML() {
  try {
    console.log('Fetching top items from Mercado Livre...');
    const response = await fetch('https://api.mercadolibre.com/sites/MLB/search?q=notebook%20gamer%20celular%20smart%20tv&sort=sold_quantity_desc&limit=12');
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      console.log('Refetching without sort...');
      const fallback = await fetch('https://api.mercadolibre.com/sites/MLB/search?q=mais%20vendidos%20tecnologia&limit=12');
      const fallbackData = await fallback.json();
      data.results = fallbackData.results;
    }

    const items = data.results.slice(0, 8);
    
    let productsStr = items.map((item, index) => {
      const price = item.price;
      const originalPrice = item.original_price || (price * (1 + (Math.random() * 0.3))).toFixed(2);
      const discount = Math.round(((originalPrice - price) / originalPrice) * 100);
      const image = item.thumbnail.replace('-I.jpg', '-O.jpg').replace('-I.webp', '-O.webp'); // Get better quality
      
      return `{
    id: ${index + 100},
    name: "${item.title.replace(/"/g, '\\"')}",
    description: "Vendido no Mercado Livre (${item.seller?.nickname || 'Líder'}). Condição: ${item.condition}. ${item.shipping?.free_shipping ? 'Tem Frete Grátis!' : ''}",
    price: ${price},
    originalPrice: ${originalPrice},
    image: "${image}",
    category: "Mercado Livre",
    rating: ${(4.2 + (Math.random() * 0.7)).toFixed(1)},
    reviews: ${Math.floor(Math.random() * 12000) + 50},
    agentData: {
      dealScore: ${80 + Math.floor(Math.random() * 20)},
      priceTrend: "${discount > 10 ? 'down' : 'up'}",
      predictedDiscount: ${Math.floor(Math.random() * 15)},
      personalizationScore: ${75 + Math.floor(Math.random() * 25)},
      stockLevel: "${item.available_quantity < 10 ? 'low' : 'high'}",
      similarProducts: [${[ ((index + 1) % 8) + 100, ((index + 2) % 8) + 100 ].join(', ')}],
      aiSummary: "Filtro MercadoLivre! Detectado com histórico quente de vendas recentes na plataforma global de buscas."
    }
  }`;
    }).join(',\n  ');

    const fileContent = `import { Product } from '../types';

export const products: Product[] = [
  ${productsStr}
];

export const categories = ['Todos', 'Mercado Livre', 'Eletrônicos', 'Computadores', 'Áudio'];
`;

    fs.writeFileSync('src/data/products.ts', fileContent, 'utf-8');
    console.log('✅ Base de dados substituida por itens reais do Mercado Livre');
  } catch(e) {
    console.error(e);
  }
}

fetchML();
