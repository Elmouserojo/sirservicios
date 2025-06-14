<?php
// ---- INICIO DE LA CONFIGURACIÓN ----

// 1. Permitimos que cualquier página web (origen) pueda solicitar datos a este script.
// Es útil para desarrollo y para que tu sitio en Vercel o local pueda probarlo.
header("Access-Control-Allow-Origin: *");
// 2. Indicamos que la respuesta que enviaremos será en formato JSON.
header("Content-Type: application/json; charset=UTF-8");

// 3. Datos de conexión a tu base de datos de wnpower.
// Ya he puesto los que me pasaste.
$servername = "localhost"; // En wnpower y la mayoría de los hostings, esto se mantiene como "localhost".
$username = "sirservi_sirusuario";
$password = "david_sirusuario";
$dbname = "sirservi_sirdb";

// ---- FIN DE LA CONFIGURACIÓN ----


// --- LÓGICA DEL SCRIPT ---

// Crear la conexión a la base de datos
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar si la conexión falló
if ($conn->connect_error) {
    // Si falla, enviamos un error y detenemos el script.
    http_response_code(500); // Error de servidor
    echo json_encode(["error" => "Falló la conexión a la base de datos: " . $conn->connect_error]);
    die();
}

// Preparamos la consulta SQL para seleccionar todos los productos
$sql = "SELECT id, name, brand, model, description, price, stock, image, alt FROM productos ORDER BY name ASC";

// Ejecutamos la consulta
$result = $conn->query($sql);

// Creamos un array vacío para guardar los productos
$products = array();

// Verificamos si la consulta devolvió resultados
if ($result->num_rows > 0) {
    // Recorremos cada fila del resultado y la añadimos a nuestro array $products
    while($row = $result->fetch_assoc()) {
        // Aseguramos que los tipos de datos sean correctos para el JSON
        $row['id'] = (int)$row['id'];
        $row['price'] = (float)$row['price'];
        $row['stock'] = (int)$row['stock'];
        $products[] = $row;
    }
}

// Cerramos la conexión a la base de datos para liberar recursos
$conn->close();

// Devolvemos el array de productos codificado como JSON.
// Esto es lo que recibirá tu `scripts.js` en el frontend.
echo json_encode($products);
?>