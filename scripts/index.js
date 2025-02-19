document.addEventListener("DOMContentLoaded", function () {
    const listaProductos = document.getElementById("listaProductos");
    const productos = JSON.parse(localStorage.getItem("productos")) || [];

    if (productos.length === 0) {
        listaProductos.innerHTML = "<p>No hay productos cargados.</p>";
        return;
    }

    listaProductos.innerHTML = productos
        .map(
            (producto, index) => `
                <div class="producto">
                    <img src="${producto.foto}" alt="${producto.nombre}">
                    <h3>${producto.nombre}</h3>
                    <p>${producto.descripcion}</p>
                    <p class="precio">Precio: $${producto.precio}</p>
                    <button onclick="agregarAlCarrito(${index})">Agregar al Carrito</button>
                </div>
            `
        )
        .join("");

    // Función para agregar un producto al carrito
    window.agregarAlCarrito = function (index) {
        const producto = productos[index];

        // Obtener el carrito actual del localStorage
        let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

        // Verificar si el producto ya está en el carrito
        const productoEnCarrito = carrito.find((p) => p.nombre === producto.nombre);

        if (productoEnCarrito) {
            alert("Este producto ya está en el carrito.");
        } else {
            // Agregar el producto al carrito
            carrito.push(producto);
            localStorage.setItem("carrito", JSON.stringify(carrito));
            alert("Producto agregado al carrito.");
        }
    };
});