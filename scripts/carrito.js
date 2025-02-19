document.addEventListener("DOMContentLoaded", function () {
  const listaCarrito = document.getElementById("carrito");
  const totalCarrito = document.getElementById("totalCarrito");

  // Obtener el carrito del localStorage
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  let total = 0;

  // Mostrar los productos en el carrito
  listaCarrito.innerHTML = carrito
    .map(
      (producto, index) => `
                <div class="producto">
                    <img src="${producto.foto}" alt="${producto.nombre}">
                    <h3>${producto.nombre}</h3>
                    <p>${producto.descripcion}</p>
                    <p class="precio">Precio: $${producto.precio}</p>
                    <button onclick="eliminarDelCarrito(${index})">Eliminar</button>
                </div>
            `
    )
    .join("");

  // Calcular el total
  total = carrito.reduce((sum, producto) => sum + (producto.precio || 0), 0);
  totalCarrito.textContent = total;

  // Función para eliminar un producto del carrito
  window.eliminarDelCarrito = function (index) {
    carrito.splice(index, 1); // Eliminar el producto del carrito
    localStorage.setItem("carrito", JSON.stringify(carrito)); // Actualizar localStorage
    location.reload(); // Recargar la página para actualizar la vista
  };
});
