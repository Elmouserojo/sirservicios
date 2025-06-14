<?php
// Incluimos el autoloader de Composer, que carga el SDK de Mercado Pago.
// Esto asume que la carpeta 'vendor' está en la raíz de tu proyecto.
require __DIR__ . '/../vendor/autoload.php';

use MercadoPago\Client\Preference\PreferenceClient;
use MercadoPago\MercadoPagoConfig;

// --- CONFIGURACIÓN DE CABECERAS (Headers) ---
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

// --- LÓGICA PRINCIPAL ---

// --- ¡IMPORTANTE! REEMPLAZA ESTO CON TU ACCESS TOKEN ---
// Cuando estés probando, usa tu Access Token de PRUEBA.
// Cuando lances el sitio para ventas reales, usa tu Access Token de PRODUCCIÓN.
$accessToken = "TU_ACCESS_TOKEN_AQUI"; 
MercadoPagoConfig::setAccessToken($accessToken);


// Recibimos los datos del producto que envía el `scripts.js` del frontend.
$json_data = file_get_contents('php://input');
$data = json_decode($json_data);

// Verificamos que los datos del producto hayan llegado y el precio sea válido.
if (!isset($data->product) || !isset($data->product->price) || $data->product->price <= 0) {
    http_response_code(400); // Error "Bad Request"
    echo json_encode(['error' => 'Datos del producto inválidos o precio no válido.']);
    exit;
}
$product = $data->product;

try {
    // Creamos un cliente de Preferencia.
    $client = new PreferenceClient();
    
    // Creamos la preferencia con la información de la compra.
    $preference = $client->create([
        "items" => [
            [
                "id" => $product->id,
                "title" => $product->name,
                "quantity" => 1,
                "currency_id" => "ARS",
                "unit_price" => (float)$product->price
            ]
        ],
        "back_urls" => [
            "success" => "https://www.sirsrvicios.ar/pago-exitoso.html",
            "failure" => "https://www.sirsrvicios.ar/pago-fallido.html",
            "pending" => "https://www.sirsrvicios.ar/pago-pendiente.html"
        ],
        "auto_return" => "approved"
    ]);

    // Devolvemos el 'init_point' (la URL de pago) al frontend.
    echo json_encode(['init_point' => $preference->init_point]);

} catch (Exception $e) {
    // Si algo falla, devolvemos un error.
    http_response_code(500);
    echo json_encode(['error' => 'Error al crear la preferencia de pago.', 'details' => $e->getMessage()]);
}

?>