document.addEventListener('DOMContentLoaded', () => {
    // --- Mobile Menu Functionality ---
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

    // --- Dynamic Copyright Year ---
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- Product Loading and Search Functionality ---
    const productsGrid = document.querySelector('.products-grid');
    const searchBar = document.getElementById('search-bar');
    let allProducts = []; // Array to store all products loaded from JSON

    // Function to display products in the grid
    function displayProducts(productsToDisplay) {
        if (!productsGrid) return; // Exit if productsGrid is not found
        productsGrid.innerHTML = ''; // Clear the current grid

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

            let stockStatusClass = '';
            let stockText = `En stock: ${product.stock} unidades`;
            if (product.stock === 0) {
                stockStatusClass = 'out'; // CSS class for out-of-stock products
                stockText = 'Agotado';
            }

            // Format price to two decimal places
            const formattedPrice = parseFloat(product.price).toFixed(2);

            // --- MODIFICACIÓN PARA WHATSAPP ---
            const productNameEncoded = encodeURIComponent(product.name);
            // Número de WhatsApp proporcionado: +54 9 11 7623-8019
            const whatsappNumber = "5491176238019"; 
            const whatsappMessage = `Hola, estoy interesado en el producto: ${product.name} (ID: ${product.id || 'N/A'}). ¿Podrían darme más información?`;
            const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
            // --- FIN DE MODIFICACIÓN PARA WHATSAPP ---

            productCard.innerHTML = `
                <div class="product-image">
                    <img src="${product.image}" alt="${product.alt}">
                </div>
                <div class="product-info">
                    <span class="product-brand">${product.brand || ''}</span>
                    <h3 class="product-name">${product.name}</h3>
                    <span class="product-model">Modelo: ${product.model || ''}</span>
                    <p class="product-description">${product.description || 'Descripción no disponible.'}</p>
                    <div class="product-price">$${formattedPrice}</div>
                    <span class="product-stock ${stockStatusClass}">${stockText}</span>
                    <a href="${whatsappLink}" class="btn btn-whatsapp" target="_blank" rel="noopener noreferrer">
                        <i class="fab fa-whatsapp"></i> Consultar por WhatsApp
                    </a>
                </div>
            `;
            productsGrid.appendChild(productCard);
        });
    }

    // Function to fetch products from products.json
    async function fetchProducts() {
        try {
            // Ensure the path to your JSON file is correct
            const response = await fetch('./data/products.json'); 
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
            }
            allProducts = await response.json();
            // Asegurarse que allProducts sea siempre un array
            if (!Array.isArray(allProducts)) {
                console.error('Error: products.json no contiene un array de productos.');
                allProducts = []; // Prevenir errores posteriores
            }
            displayProducts(allProducts); // Display all products initially
        } catch (error) {
            console.error("Error fetching products:", error);
            allProducts = []; // Asegurar que allProducts es un array en caso de error
            if (productsGrid) {
                productsGrid.innerHTML = `<p class="error-message">Error al cargar los productos: ${error.message}. Por favor, intente más tarde.</p>`;
            }
        }
    }

    // Event Listener for the search bar
    if (searchBar) {
        searchBar.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            // Asegurarse que allProducts es un array antes de filtrar
            if (!Array.isArray(allProducts)) {
                displayProducts([]); // Mostrar nada o un mensaje si allProducts no es un array
                return;
            }
            const filteredProducts = allProducts.filter(product => {
                // Check against multiple fields for a more comprehensive search
                // y asegurarse que los campos existen en el objeto producto antes de llamar a toLowerCase()
                const nameMatch = product.name && product.name.toLowerCase().includes(searchTerm);
                const brandMatch = product.brand && product.brand.toLowerCase().includes(searchTerm);
                const modelMatch = product.model && product.model.toLowerCase().includes(searchTerm);
                const descriptionMatch = product.description && product.description.toLowerCase().includes(searchTerm);
                return nameMatch || brandMatch || modelMatch || descriptionMatch;
            });
            displayProducts(filteredProducts);
        });
    }

    // Fetch products when the script runs (after DOM is loaded)
    fetchProducts();
});