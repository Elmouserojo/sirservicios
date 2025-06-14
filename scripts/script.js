document.addEventListener('DOMContentLoaded', () => {
    // --- Funcionalidad del Menú Móvil y Copyright (sin cambios) ---
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('nav#main-nav');
    if (mobileMenuBtn && nav) {
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

    // --- Lógica de Productos ---
    const productsGrid = document.querySelector('.products-grid');
    const searchBar = document.getElementById('search-bar');
    let allProducts = [];

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

            let stockStatusClass = product.stock === 0 ? 'out' : '';
            let stockText = product.stock === 0 ? 'Agotado' : `En stock: ${product.stock} unidades`;
            
            let buyButtonText = 'Pagar con Mercado Pago';
            let isPayable = true;

            if (product.stock === 0) {
                buyButtonText = 'Sin Stock';
                isPayable = false;
            } else if (productPrice <= 0) {
                buyButtonText = 'Consultar Precio';
                isPayable = false;
            }
            
            const whatsappNumber = "5491176238019";
            const whatsappMessage = `Hola, estoy interesado en el producto: ${product.name} (ID: ${product.id || 'N/A'}). ¿Podrían darme más información?`;
            const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

            const finalButton = isPayable
                ? `<button class="btn btn-pay" data-product-id="${product.id}">${buyButtonText}</button>`
                : `<a href="${whatsappLink}" class="btn btn-whatsapp" target="_blank" rel="noopener noreferrer"><i class="fab fa-whatsapp"></i> ${buyButtonText}</a>`;

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

    if (productsGrid) {
        productsGrid.addEventListener('click', async (e) => {
            if (e.target && e.target.classList.contains('btn-pay')) {
                const button = e.target;
                button.disabled = true;
                button.textContent = 'Procesando...';

                const productId = parseInt(button.dataset.productId, 10);
                const productToBuy = allProducts.find(p => p.id === productId);

                if (!productToBuy) {
                    alert('Error: Producto no encontrado.');
                    button.textContent = 'Error';
                    return;
                }

                try {
                    // --- CAMBIO #2: Apuntamos al script PHP de Mercado Pago ---
                    const response = await fetch('/api/create_preference.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ product: productToBuy }),
                    });

                    const data = await response.json();

                    if (response.ok) {
                        window.location.href = data.init_point;
                    } else {
                        throw new Error(data.error || 'No se pudo crear el link de pago.');
                    }
                } catch (error) {
                    console.error('Error al procesar el pago:', error);
                    alert(`Error: ${error.message}`);
                    button.disabled = false;
                    button.textContent = 'Pagar con Mercado Pago';
                }
            }
        });
    }

    async function fetchProducts() {
      try {
            // --- CAMBIO #1: Apuntamos al script PHP que obtiene los productos ---
            const response = await fetch('/api/get_products.php'); 
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
            }
            allProducts = await response.json();
            if (!Array.isArray(allProducts)) { allProducts = []; }
            displayProducts(allProducts);
        } catch (error) {
            console.error("Error al cargar los productos:", error);
            allProducts = []; 
            if (productsGrid) {
                productsGrid.innerHTML = `<p class="error-message">Error al cargar los productos. Por favor, intente más tarde.</p>`;
            }
        }
    }

    if (searchBar) {
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