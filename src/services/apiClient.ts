import { Product } from '../types';

// Detecta se estamos no servidor de desenvolvimento local ou compilados na Hostinger
export const API_URL = (import.meta as any).env?.DEV 
    ? 'http://localhost/api.php' // Ajuste se seu PHP rodar noutra porta localmente
    : '/api.php';                // Caminho relativo funciona nativo na Hostinger public_html

export interface DBCalibration {
    id: number;
    user_id: number;
    intent: string;
    terms: string[];
    created_at: string;
}

export const apiClient = {
    async getCalibrations(): Promise<DBCalibration[]> {
        try {
            const res = await fetch(`${API_URL}?action=getCalibrations&user_id=1`);
            const data = await res.json();
            return data.calibrations || [];
        } catch (e) {
            console.error('API Error:', e);
            return [];
        }
    },

    async saveCalibration(intent: string, terms: string[]): Promise<number | null> {
        try {
            const res = await fetch(`${API_URL}?action=saveCalibration&user_id=1`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ intent, terms })
            });
            const data = await res.json();
            return data.calibration_id || null;
        } catch (e) {
            console.error('API Error:', e);
            return null;
        }
    },

    async deleteCalibration(id: number): Promise<boolean> {
        try {
            const res = await fetch(`${API_URL}?action=deleteCalibration&user_id=1`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ calibration_id: id })
            });
            const data = await res.json();
            return data.success === true;
        } catch (e) {
            console.error('API Error:', e);
            return false;
        }
    },

    async getProducts(): Promise<Product[]> {
        try {
            const res = await fetch(`${API_URL}?action=getProducts&user_id=1`);
            const data = await res.json();
            const dbProds = data.products || [];
            
            return dbProds.map((p: any): Product => ({
                id: Number(p.id), // ID real do banco
                name: p.title || 'Produto sem nome',
                description: `Sincronizado via ${p.source || 'Banco de Dados'}`,
                price: Number(p.price) || 0,
                originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
                image: p.image || 'https://images.unsplash.com/photo-1555487401-49666f212217?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=500',
                category: p.source || 'Geral',
                rating: Number(p.rating) || 4.5,
                reviews: Number(p.reviews) || 0,
                agentData: {
                    dealScore: 90,
                    priceTrend: 'stable',
                    personalizationScore: 85,
                    stockLevel: 'medium',
                    similarProducts: [],
                    aiSummary: p.badge || 'Analisado pelo Agente'
                }
            }));
        } catch (e) {
            console.error('API Error:', e);
            return [];
        }
    },

    async saveProduct(p: Partial<Product>, calibrationId?: number): Promise<boolean> {
        try {
            const payload = {
                id: p.id,
                title: p.name,
                price: p.price,
                originalPrice: p.originalPrice,
                source: 'Mercado Livre',
                image: p.image,
                rating: p.rating,
                reviews: p.reviews,
                badge: p.agentData?.aiSummary,
                aiTags: [],
                calibrationId
            };
            const res = await fetch(`${API_URL}?action=saveProduct&user_id=1`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            return data.success === true;
        } catch (e) {
            console.error('API Error:', e);
            return false;
        }
    }
};
