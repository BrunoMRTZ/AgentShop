// src/services/observability.index.ts

// Observability Configuration
const observabilityConfig = {
    serviceName: 'AgentShop',
    logLevel: 'info',
    metricsEnabled: true,
    tracingEnabled: true,
};

// Event Types
const eventTypes = {
    USER_SIGNUP: 'USER_SIGNUP',
    USER_LOGIN: 'USER_LOGIN',
    ORDER_PLACED: 'ORDER_PLACED',
};

// Centralized Manager for Handling Observability Events
class ObservabilityManager {
    static logEvent(eventType, eventData) {
        console.log(`[${new Date().toISOString()}] Event Type: ${eventType}`, eventData);
    }

    static configure(config) {
        // Configure observability parameters
        Object.assign(observabilityConfig, config);
    }
}

// Exporting the necessary configurations and manager
export { observabilityConfig, eventTypes, ObservabilityManager };