import { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import { AgentProvider } from './context/AgentContext';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { ProductGrid } from './components/ProductGrid';
import { ProductDetail } from './components/ProductDetail';
import { SmartCart } from './components/SmartCart';
import { AIChatAssistant } from './components/AIChatAssistant';
import { AgentRecommendations } from './components/AgentRecommendations';
import { AgentFeatures } from './components/AgentFeatures';
import { Footer } from './components/Footer';
import { CheckoutAgent } from './components/CheckoutAgent';
import { UserDashboard } from './components/UserDashboard';
import { ProfileCalibration } from './components/ProfileCalibration';
import { Product } from './types';
import { apiClient, DBCalibration } from './services/apiClient';

function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [calibrationOpen, setCalibrationOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCalibrations, setActiveCalibrations] = useState<DBCalibration[]>([]);

  useEffect(() => {
    // Busca inicial do banco
    apiClient.getCalibrations().then(calibs => {
      if (calibs && calibs.length > 0) setActiveCalibrations(calibs);
    });
  }, []);

  return (
    <CartProvider>
      <AgentProvider>
        <div className="min-h-screen bg-gray-50/50">
          <Header
            onCartClick={() => setCartOpen(true)}
            onSearch={setSearchQuery}
            onUserClick={() => setDashboardOpen(true)}
          />
          <HeroSection />
          <AgentRecommendations />
          <ProductGrid
            searchQuery={searchQuery}
            activeCalibrations={activeCalibrations}
            onRemoveCalibration={async (calId) => {
               await apiClient.deleteCalibration(calId);
               setActiveCalibrations(prev => prev.filter(c => c.id !== calId));
            }}
            onViewDetails={setSelectedProduct}
          />
          <AgentFeatures />
          <Footer />

          {/* Modals */}
          {selectedProduct && (
            <ProductDetail
              product={selectedProduct}
              onClose={() => setSelectedProduct(null)}
            />
          )}

          <SmartCart isOpen={cartOpen} onClose={() => setCartOpen(false)} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }} />
          <AIChatAssistant />
          <CheckoutAgent isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
          <UserDashboard isOpen={dashboardOpen} onClose={() => setDashboardOpen(false)} onCalibrate={() => { setDashboardOpen(false); setCalibrationOpen(true); }} />
          <ProfileCalibration 
            isOpen={calibrationOpen} 
            onClose={() => setCalibrationOpen(false)} 
            onCalibrateComplete={async (query, terms = []) => {
              setCalibrationOpen(false);
              if (query) {
                // Salvar calibração diretamente via MySQL
                const id = await apiClient.saveCalibration(query, terms);
                if (id) {
                    const newCal: DBCalibration = { id, user_id: 1, intent: query, terms, created_at: new Date().toISOString() };
                    setActiveCalibrations(prev => [...prev, newCal]);
                }
              }
              setTimeout(() => {
                document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
              }, 300);
            }}
          />
        </div>
      </AgentProvider>
    </CartProvider>
  );
}

export default App;
