// observability.ts

class ObservabilityService {
    constructor() {
        this.registeredProducts = [];
    }

    registerProduct(product) {
        this.registeredProducts.push(product);
        console.log(`Product registered: ${product}`);
    }

    monitorProduct(productId) {
        const product = this.registeredProducts.find(p => p.id === productId);
        if (product) {
            console.log(`Monitoring product: ${product.name}`);
        } else {
            console.log(`Product not found: ${productId}`);
        }
    }

    trackWebEvent(event) {
        console.log(`Tracking event: ${event}`);
        // Here we can add logic to send event data to an analytics service
    }
}

export default new ObservabilityService();
