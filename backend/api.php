<?php
/**
 * AgentShop - Hostinger PHP API
 * Faça upload deste arquivo para o Gerenciador de Arquivos da Hostinger (ex: dentro da pasta public_html/api.php)
 */

header('Access-Control-Allow-Origin: *'); // Em produção, altere para o seu domínio real
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = 'localhost';
$db = 'u614611176_agentshop';
$user = 'u614611176_botat';
$pass = '013478Admin.'; // ⚠️ ATENÇÃO: COLOQUE A SENHA DO BANCO DE DADOS AQUI
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    echo json_encode(['error' => 'Falha na conexão com banco de dados.']);
    exit;
}

$action = $_GET['action'] ?? '';
$userId = $_GET['user_id'] ?? 1; // Simplificado para fins de demonstração

try {
    switch ($action) {
        case 'saveCalibration':
            $input = json_decode(file_get_contents('php://input'), true);
            $stmt = $pdo->prepare("INSERT INTO user_calibrations (user_id, intent, terms) VALUES (?, ?, ?)");
            $stmt->execute([$userId, $input['intent'], json_encode($input['terms'])]);

            echo json_encode([
                'success' => true,
                'calibration_id' => $pdo->lastInsertId()
            ]);
            break;

        case 'getCalibrations':
            $stmt = $pdo->prepare("SELECT * FROM user_calibrations WHERE user_id = ? ORDER BY created_at ASC");
            $stmt->execute([$userId]);
            $calibrations = $stmt->fetchAll();

            foreach ($calibrations as &$cal) {
                $cal['terms'] = json_decode($cal['terms'], true);
            }

            echo json_encode(['calibrations' => $calibrations]);
            break;

        case 'saveProduct':
            $input = json_decode(file_get_contents('php://input'), true);
            $stmt = $pdo->prepare("
                INSERT INTO user_products 
                (user_id, original_id, title, price, original_price, source, image, rating, reviews, url, badge, ai_tags, calibrated_by_intent_id) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $userId,
                $input['id'],
                $input['title'],
                $input['price'],
                $input['originalPrice'] ?? null,
                $input['source'] ?? 'Mercado Livre',
                $input['image'],
                $input['rating'] ?? 0,
                $input['reviews'] ?? 0,
                $input['url'] ?? '',
                $input['badge'] ?? null,
                json_encode($input['aiTags'] ?? []),
                $input['calibrationId'] ?? null
            ]);

            echo json_encode(['success' => true, 'product_id' => $pdo->lastInsertId()]);
            break;

        case 'getProducts':
            $stmt = $pdo->prepare("SELECT * FROM user_products WHERE user_id = ? ORDER BY added_at DESC");
            $stmt->execute([$userId]);
            $products = $stmt->fetchAll();

            foreach ($products as &$p) {
                $p['aiTags'] = json_decode($p['ai_tags'], true);
                $p['originalPrice'] = $p['original_price'];
                unset($p['ai_tags'], $p['original_price']); // Formatando para dar match no frontend
            }

            echo json_encode(['products' => $products]);
            break;

        case 'deleteCalibration':
            $calId = $_POST['calibration_id'] ?? json_decode(file_get_contents('php://input'), true)['calibration_id'] ?? null;
            if ($calId) {
                $stmt = $pdo->prepare("DELETE FROM user_calibrations WHERE id = ? AND user_id = ?");
                $stmt->execute([$calId, $userId]);
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['error' => 'Falta calibration_id']);
            }
            break;

        default:
            echo json_encode(['error' => 'Ação inválida.']);
            break;
    }
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>