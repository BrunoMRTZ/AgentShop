-- Execute isto no phpMyAdmin da Hostinger para o banco de dados: u614611176_agentshop

-- 1. Tabela de Usuários (necessário para gerenciar os produtos por perfil)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir um usuário principal de depuração (opcional, para testes no front)
INSERT IGNORE INTO users (id, name, email) VALUES (1, 'Admin AgentShop', 'admin@agentshop.local');

-- 2. Tabela de Calibrações Ativas do Usuário
CREATE TABLE IF NOT EXISTS user_calibrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    intent TEXT NOT NULL,
    terms JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Tabela Privada de Produtos do Usuário
CREATE TABLE IF NOT EXISTS user_products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    original_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    source VARCHAR(50),
    image TEXT,
    rating DECIMAL(2,1),
    reviews INT,
    url TEXT,
    badge VARCHAR(100),
    ai_tags JSON,
    calibrated_by_intent_id INT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (calibrated_by_intent_id) REFERENCES user_calibrations(id) ON DELETE SET NULL
);
