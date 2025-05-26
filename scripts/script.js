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

            productCard.innerHTML = `
                <div class="product-image">
                    <img src="${product.image}" alt="${product.alt}">
                </div>
                <div class="product-info">
                    <span class="product-brand">${product.brand}</span>
                    <h3 class="product-name">${product.name}</h3>
                    <span class="product-model">Modelo: ${product.model}</span>
                    <p class="product-description">${product.description}</p>
                    <div class="product-price">$${formattedPrice}</div>
                    <span class="product-stock ${stockStatusClass}">${stockText}</span>
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
            displayProducts(allProducts); // Display all products initially
        } catch (error) {
            console.error("Error fetching products:", error);
            if (productsGrid) {
                productsGrid.innerHTML = `<p class="error-message">Error al cargar los productos: ${error.message}. Por favor, intente más tarde.</p>`;
            }
        }
    }

    // Event Listener for the search bar
    if (searchBar) {
        searchBar.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            const filteredProducts = allProducts.filter(product => {
                // Check against multiple fields for a more comprehensive search
                return (
                    product.name.toLowerCase().includes(searchTerm) ||
                    product.brand.toLowerCase().includes(searchTerm) ||
                    product.model.toLowerCase().includes(searchTerm) ||
                    product.description.toLowerCase().includes(searchTerm)
                );
            });
            displayProducts(filteredProducts);
        });
    }

    // Fetch products when the script runs (after DOM is loaded)
    fetchProducts();
});