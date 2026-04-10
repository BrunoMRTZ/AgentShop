// database.service.ts

import axios from 'axios';
import { Product } from '../models/product.model';

const API_URL = 'backend/api.php';

export class DatabaseService {
    private userId: string;

    constructor(userId: string) {
        this.userId = userId;
    }
    
    public async saveProduct(product: Product): Promise<Product> {
        try {
            const response = await axios.post(`${API_URL}?action=saveProduct`, { product, userId: this.userId });
            return response.data;
        } catch (error) {
            console.error('Error saving product:', error);
            throw error;
        }
    }
    
    public async getProducts(): Promise<Product[]> {
        try {
            const response = await axios.get(`${API_URL}?action=getProducts&userId=${this.userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    }
    
    public async getProductById(id: number): Promise<Product> {
        try {
            const products = await this.getProducts();
            return products.find(p => p.id === id);
        } catch (error) {
            console.error('Error fetching product by ID:', error);
            throw error;
        }
    }
    
    public async updateProduct(product: Product): Promise<Product> {
        try {
            return await this.saveProduct(product);
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    }
    
    public async saveCalibration(calibrationData: any): Promise<any> {
        try {
            const response = await axios.post(`${API_URL}?action=saveCalibration`, { calibrationData, userId: this.userId });
            return response.data;
        } catch (error) {
            console.error('Error saving calibration:', error);
            throw error;
        }
    }
    
    public async getCalibrations(): Promise<any[]> {
        try {
            const response = await axios.get(`${API_URL}?action=getCalibrations&userId=${this.userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching calibrations:', error);
            throw error;
        }
    }
    
    public async deleteCalibration(calibrationId: number): Promise<void> {
        try {
            await axios.delete(`${API_URL}?action=deleteCalibration&calibrationId=${calibrationId}&userId=${this.userId}`);
        } catch (error) {
            console.error('Error deleting calibration:', error);
            throw error;
        }
    }
}
