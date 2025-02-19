document.addEventListener("DOMContentLoaded", function () {
    const formCarga = document.getElementById("formCargaProducto");
    const listaProductos = document.getElementById("listaProductos");

    // Cargar productos al iniciar
    mostrarProductos();

    // Evento para agregar un nuevo producto
    formCarga.addEventListener("submit", function (event) {
        event.preventDefault();

        // Captura de datos del formulario
        const foto = document.getElementById("fotoProducto").files[0];
        const nombre = document.getElementById("nombreProducto").value;
        const descripcion = document.getElementById("descripcionProducto").value;
        const precio = parseFloat(document.getElementById("precioProducto").value);

        // Validación básica
        if (!foto || !nombre || !descripcion || isNaN(precio)) {
            alert("Por favor, complete todos los campos correctamente.");
            return;
        }

        // Obtener solo el nombre del archivo de la imagen
        const fotoSrc = `./imagenes/${foto.name}`;

        // Crear objeto producto
        const producto = {
            foto: fotoSrc,
            nombre,
            descripcion,
            precio,
        };

        // Obtener productos de localStorage
        let productos = JSON.parse(localStorage.getItem("productos")) || [];

        if (!Array.isArray(productos)) {
            productos = [];
        }

        // Agregar el nuevo producto al array
        productos.push(producto);

        // Guardar en localStorage
        localStorage.setItem("productos", JSON.stringify(productos));

        // Mensaje de éxito
        alert("Producto cargado exitosamente.");
        document.getElementById("formCargaProducto").reset();

        // Actualizar la lista de productos
        mostrarProductos();
    });

    // Función para mostrar los productos
    function mostrarProductos() {
        const productos = JSON.parse(localStorage.getItem("productos")) || [];
        listaProductos.innerHTML = "";

        if (productos.length === 0) {
            listaProductos.innerHTML = "<p>No hay productos cargados.</p>";
            return;
        }

        productos.forEach((producto, index) => {
            const divProducto = document.createElement("div");
            divProducto.classList.add("producto");

            // Verificar si el producto tiene un precio
            const precio = producto.precio || 0; // Si no tiene precio, usar 0

            divProducto.innerHTML = `
                <img src="${producto.foto}" alt="${producto.nombre}">
                <h3>${producto.nombre}</h3>
                <p>${producto.descripcion}</p>
                <p>Precio: $${precio.toFixed(2)}</p>
                <button onclick="eliminarProducto(${index})">Eliminar</button>
            `;

            listaProductos.appendChild(divProducto);
        });
    }

    // Función para eliminar un producto
    window.eliminarProducto = function (index) {
        let productos = JSON.parse(localStorage.getItem("productos")) || [];

        if (index >= 0 && index < productos.length) {
            productos.splice(index, 1); // Eliminar el producto del array
            localStorage.setItem("productos", JSON.stringify(productos)); // Actualizar localStorage
            mostrarProductos(); // Actualizar la lista de productos
            alert("Producto eliminado exitosamente.");
        } else {
            alert("Error: Índice de producto no válido.");
        }
    };
});