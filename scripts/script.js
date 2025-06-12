document.addEventListener('DOMContentLoaded', () => {
    // --- Funcionalidad del Menú Móvil y Copyright (sin cambios) ---
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('nav#main-nav');
    if (mobileMenuBtn && nav) {
        // (código del menú sin cambios...)
        mobileMenuBtn.addEventListener('click', () => {
            const isExpanded = nav.classList.toggle('active');
            mobileMenuBtn.setAttribute('aria-expanded', isExpanded.toString());
        });
        document.querySelectorAll('nav#main-nav ul li a').forEach(link => {
            link.addEventListener('click', () => {
                if (nav.classList.contains('active')) {
                    nav.classList.remove('active');
                    mobileMenuBtn.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- Lógica de Productos (con cambios importantes) ---
    const productsGrid = document.querySelector('.products-grid');
    const searchBar = document.getElementById('search-bar');
    let allProducts = [];

    // Reemplaza la función displayProducts en tu archivo ./scripts/script.js

function displayProducts(productsToDisplay) {
    if (!productsGrid) return;
    productsGrid.innerHTML = '';

    if (productsToDisplay.length === 0) {
        if (searchBar && searchBar.value.trim() !== '') {
            productsGrid.innerHTML = '<p class="no-products-message">No se encontraron productos que coincidan con tu búsqueda.</p>';
        } else {
             productsGrid.innerHTML = '<p class="no-products-message">No hay productos disponibles en este momento.</p>';
        }
        return;
    }

    productsToDisplay.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';

        const productPrice = parseFloat(product.price);
        const formattedPrice = productPrice.toFixed(2);

        // --- INICIO DE LA LÓGICA MEJORADA PARA EL BOTÓN ---
        let stockStatusClass = product.stock === 0 ? 'out' : '';
        let stockText = product.stock === 0 ? 'Agotado' : `En stock: ${product.stock} unidades`;
        
        let buyButtonText = 'Pagar con Mercado Pago';
        let buyButtonDisabled = false;

        if (product.stock === 0) {
            buyButtonText = 'Sin Stock';
            buyButtonDisabled = true;
        } else if (productPrice <= 0) {
            buyButtonText = 'Consultar Precio';
            // Para el botón de consultar, podríamos cambiarlo por un enlace a WhatsApp
            // Por ahora, simplemente lo desactivaremos para el pago.
            buyButtonDisabled = true; 
        }
        // --- FIN DE LA LÓGICA MEJORADA PARA EL BOTÓN ---
        
        const productNameEncoded = encodeURIComponent(product.name);
        const whatsappNumber = "5491176238019";
        const whatsappMessage = `Hola, estoy interesado en el producto: ${product.name} (ID: ${product.id || 'N/A'}). ¿Podrían darme más información sobre el precio y la disponibilidad?`;
        const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

        // Si el precio es 0, podríamos mostrar el botón de WhatsApp en lugar del de pago.
        const finalButton = buyButtonDisabled && productPrice <= 0 
            ? `<a href="${whatsappLink}" class="btn btn-whatsapp" target="_blank" rel="noopener noreferrer"><i class="fab fa-whatsapp"></i> ${buyButtonText}</a>`
            : `<button class="btn btn-pay" data-product-id="${product.id}" ${buyButtonDisabled ? 'disabled' : ''}>${buyButtonText}</button>`;


        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.alt}">
            </div>
            <div class="product-info">
                <span class="product-brand">${product.brand || ''}</span>
                <h3 class="product-name">${product.name}</h3>
                <span class="product-model">Modelo: ${product.model || ''}</span>
                <p class="product-description">${product.description || 'Descripción no disponible.'}</p>
                <div class="product-price">${productPrice > 0 ? '$' + formattedPrice : ''}</div>
                <span class="product-stock ${stockStatusClass}">${stockText}</span>
                ${finalButton}
            </div>
        `;
        productsGrid.appendChild(productCard);
    });
}
    // --- INICIO DE NUEVA LÓGICA PARA MANEJAR EL PAGO ---
    // Usamos "delegación de eventos" para escuchar clics en los botones de pago
    if (productsGrid) {
        productsGrid.addEventListener('click', async (e) => {
            // Verificamos si el elemento clickeado es un botón de pago
            if (e.target && e.target.classList.contains('btn-pay')) {
                const button = e.target;
                button.disabled = true; // Desactivar el botón para evitar múltiples clics
                button.textContent = 'Procesando...'; // Dar feedback al usuario

                const productId = parseInt(button.dataset.productId, 10);
                const productToBuy = allProducts.find(p => p.id === productId);

                if (!productToBuy) {
                    alert('Error: Producto no encontrado.');
                    button.textContent = 'Error';
                    return;
                }

                try {
                    // Hacemos la llamada (fetch) a nuestra función serverless
                    const response = await fetch('/api/crear-preferencia', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ product: productToBuy }),
                    });

                    const data = await response.json();

                    if (response.ok) {
                        // Si todo sale bien, redirigimos al link de pago de Mercado Pago
                        window.location.href = data.init_point;
                    } else {
                        // Si hay un error desde nuestro backend, lo mostramos
                        throw new Error(data.error || 'No se pudo crear el link de pago.');
                    }
                } catch (error) {
                    console.error('Error al procesar el pago:', error);
                    alert(`Error: ${error.message}`);
                    button.disabled = false; // Reactivar el botón si hay error
                    button.textContent = 'Pagar con Mercado Pago';
                }
            }
        });
    }
    // --- FIN DE NUEVA LÓGICA PARA MANEJAR EL PAGO ---

    // Función para cargar productos (sin cambios)
    async function fetchProducts() {
      // (código de fetchProducts sin cambios...)
      try {
            const response = await fetch('./data/products.json'); 
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
            }
            allProducts = await response.json();
            if (!Array.isArray(allProducts)) { allProducts = []; }
            displayProducts(allProducts); 
        } catch (error) {
            console.error("Error fetching products:", error);
            allProducts = []; 
            if (productsGrid) {
                productsGrid.innerHTML = `<p class="error-message">Error al cargar los productos. Por favor, intente más tarde.</p>`;
            }
        }
    }

    // Listener de la barra de búsqueda (sin cambios)
    if (searchBar) {
      // (código del listener sin cambios...)
      searchBar.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            if (!Array.isArray(allProducts)) { displayProducts([]); return; }
            const filteredProducts = allProducts.filter(product => {
                const nameMatch = product.name && product.name.toLowerCase().includes(searchTerm);
                const brandMatch = product.brand && product.brand.toLowerCase().includes(searchTerm);
                const modelMatch = product.model && product.model.toLowerCase().includes(searchTerm);
                const descriptionMatch = product.description && product.description.toLowerCase().includes(searchTerm);
                return nameMatch || brandMatch || modelMatch || descriptionMatch;
            });
            displayProducts(filteredProducts);
        });
    }

    fetchProducts();
});