import { Bot, Mail, MapPin, Phone, Heart, Shield, Truck, RefreshCw } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* CTA Section */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Pronto para comprar com inteligência?
            </h3>
            <p className="text-violet-100 max-w-md mx-auto mb-6">
              Deixe nossos agentes encontrarem as melhores ofertas para você enquanto você foca no que importa
            </p>
            <div className="flex items-center justify-center gap-3 text-sm text-white/80">
              <Shield className="w-4 h-4" />
              <span>Compra protegida</span>
              <Truck className="w-4 h-4" />
              <span>Entrega expressa</span>
              <RefreshCw className="w-4 h-4" />
              <span>Devolução grátis</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">AgentShop</h4>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Agentic Retail</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              A primeira plataforma de e-commerce com agentes de IA autônomos que trabalham para você 24/7.
            </p>
          </div>

          {/* Links */}
          <div>
            <h5 className="text-white font-semibold mb-4">Plataforma</h5>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-violet-400 transition-colors">Como funciona</a></li>
              <li><a href="#" className="hover:text-violet-400 transition-colors">Agentes IA</a></li>
              <li><a href="#" className="hover:text-violet-400 transition-colors">Previsão de preços</a></li>
              <li><a href="#" className="hover:text-violet-400 transition-colors">Proteção de compra</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-semibold mb-4">Suporte</h5>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-violet-400 transition-colors">Central de ajuda</a></li>
              <li><a href="#" className="hover:text-violet-400 transition-colors">Falar com o agente</a></li>
              <li><a href="#" className="hover:text-violet-400 transition-colors">Devoluções</a></li>
              <li><a href="#" className="hover:text-violet-400 transition-colors">Rastrear pedido</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h5 className="text-white font-semibold mb-4">Contato</h5>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-violet-400" />
                <span>brunojjmartinez@gmail.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-violet-400" />
                <span>(11) 9999-0000</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-violet-400" />
                <span>Brasília, DF</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © 2026 AgentShop. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span>Feito por Bruno Martinez</span>
            <Heart className="w-3 h-3 text-red-400 fill-red-400" />
            <span>e Inteligência Artificial</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
