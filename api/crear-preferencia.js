// Importamos el SDK de Mercado Pago
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Esta es la función principal que se ejecutará cuando se llame a /api/crear-preferencia
// Vercel automáticamente convierte archivos en la carpeta /api en funciones serverless
export default async function handler(request, response) {
  
  // Solo permitimos que esta función se llame con el método POST
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  // --- CONFIGURACIÓN DE MERCADO PAGO ---
  // Obtenemos el Access Token de una Variable de Entorno para mantenerlo seguro
  // NUNCA escribas tu Access Token directamente en el código.
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    return response.status(500).json({ error: 'Mercado Pago Access Token no está configurado.' });
  }

  // Creamos un cliente de Mercado Pago con nuestras credenciales seguras
  const client = new MercadoPagoConfig({ accessToken });
  const preference = new Preference(client);

  try {
    // Obtenemos los datos del producto del cuerpo de la petición que enviará el frontend
    const { product } = request.body;
    
    // Verificamos que tengamos un producto
    if (!product) {
        return response.status(400).json({ error: 'No se proporcionaron datos del producto.' });
    }

    // --- CREACIÓN DE LA PREFERENCIA DE PAGO ---
    const preferenceData = {
      // Lista de ítems a comprar
      items: [
        {
          id: product.id,
          title: product.name,
          description: product.description,
          picture_url: product.image, // URL de la imagen del producto
          quantity: 1, // Por ahora, asumimos que se compra 1 unidad
          currency_id: 'ARS', // Moneda: Pesos Argentinos
          unit_price: parseFloat(product.price), // El precio del producto
        },
      ],
      // URLs a las que el cliente será redirigido después del pago
      back_urls: {
        success: 'https://SITIO_WEB_DE_SIR_SERVICIOS/pago-exitoso', // Cambia esto por tu URL real
        failure: 'https://SITIO_WEB_DE_SIR_SERVICIOS/pago-fallido',
        pending: 'https://SITIO_WEB_DE_SIR_SERVICIOS/pago-pendiente',
      },
      // Redirigir automáticamente a la página de éxito si el pago es aprobado
      auto_return: 'approved',
    };

    // Usamos el SDK para crear la preferencia
    const result = await preference.create({ body: preferenceData });

    // Devolvemos el 'init_point' al frontend. Esta es la URL de pago de Mercado Pago.
    response.status(200).json({ init_point: result.init_point });

  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Error al crear la preferencia de pago.', details: error.message });
  }
}