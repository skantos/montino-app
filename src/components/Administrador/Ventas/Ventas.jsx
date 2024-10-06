import React, { useEffect, useState, useContext } from "react";
import NavbarAdmin from "../NavbarAdmin.jsx";
import { AuthContext } from "../../../context/AuthContext.jsx";
import "../../../styles/ventas.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { db, auth } from "../../../firebase.jsx";
import {
  collection,
  getDocs,
  doc,
  addDoc,
  writeBatch,
} from "firebase/firestore";

const Ventas = () => {
  const { currentUser } = useContext(AuthContext);
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState("");
  const [carrito, setCarrito] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tipoPago, setTipoPago] = useState("efectivo");
  const [cantidadEntregada, setCantidadEntregada] = useState(0);
  const [vuelto, setVuelto] = useState(0);
  const [idProductoBuscado, setIdProductoBuscado] = useState("");
  const [cantidadBuscada, setCantidadBuscada] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false); // Nuevo estado
  
  const handleCloseModal = () => {
    setOpenModal(false);
    setProductoEditado(null);
  };

  useEffect(() => {
    const getProductos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "productos"));
        const productosData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProductos(productosData);
      } catch (error) {
        setError("Error al obtener los productos");
        console.error("Error al obtener los productos:", error);
      } finally {
        setLoading(false);
      }
    };

    getProductos();
  }, [currentUser]);

  useEffect(() => {
    if (idProductoBuscado.length > 0) {
      const productoEncontrado = productos.find(
        (producto) => String(producto.id) === idProductoBuscado
      );

      if (productoEncontrado) {
        agregarAlCarrito(productoEncontrado, cantidadBuscada);
        setIdProductoBuscado("");
        setCantidadBuscada(1);
      } else {
        setError("Producto no encontrado.");

        setTimeout(() => {
          setError("");
          setIdProductoBuscado("");
          setCantidadBuscada(1);
        }, 3000);
      }
    }
  }, [idProductoBuscado, productos, cantidadBuscada]);

  const filtrarInventario = (e) => {
    setIdProductoBuscado(e.target.value);
  };

  const agregarAlCarrito = (producto, cantidad) => {
    setCarrito((prevCarrito) => {
      const productoExistente = prevCarrito.find(
        (item) => item.id === producto.id
      );
      if (productoExistente) {
        if (
          productoExistente.cantidad + cantidad <=
          producto.cantidadProducto
        ) {
          return prevCarrito.map((item) =>
            item.id === producto.id
              ? { ...item, cantidad: item.cantidad + cantidad }
              : item
          );
        } else {
          alert("Stock insuficiente");
          return prevCarrito;
        }
      } else {
        if (producto.cantidadProducto >= cantidad) {
          return [
            ...prevCarrito,
            {
              ...producto,
              cantidad,
              precioOriginal: producto.precioOriginal,
              stockDisponible: producto.cantidadProducto,
            },
          ];
        } else {
          alert("Stock insuficiente");
          return prevCarrito;
        }
      }
    });
  };

  const incrementarCantidad = (idProducto) => {
    setCarrito((prevCarrito) => {
      const producto = prevCarrito.find((item) => item.id === idProducto);
      const stockProducto = productos.find(
        (item) => item.id === idProducto
      )?.cantidadProducto;
  
      if (producto && stockProducto > producto.cantidad) {
        return prevCarrito.map((item) =>
          item.id === idProducto
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      } else if (producto && stockProducto === 0) {
        alert("El stock del producto es 0");
        return prevCarrito;
      } else {
        alert("Stock insuficiente");
        return prevCarrito;
      }
    });
  };

  const decrementarCantidad = (idProducto) => {
    setCarrito((prevCarrito) =>
      prevCarrito.map((producto) =>
        producto.id === idProducto
          ? {
              ...producto,
              cantidad: Math.max(1, producto.cantidad - 1),
            }
          : producto
      )
    );
  };

  const eliminarDelCarrito = (idProducto) => {
    setCarrito((prevCarrito) =>
      prevCarrito.filter((producto) => producto.id !== idProducto)
    );
  };

  const handleTipoPagoChange = (e) => {
    setTipoPago(e.target.value);
    if (e.target.value === "efectivo") {
      setCantidadEntregada(0);
      setVuelto(0);
    }
  };

  const handleCantidadEntregadaChange = (e) => {
    const cantidad = parseFloat(e.target.value);
    setCantidadEntregada(cantidad);
    const totalVenta = carrito.reduce(
      (total, producto) => total + producto.precioProducto * producto.cantidad,
      0
    );
    setVuelto(cantidad - totalVenta);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (carrito.length === 0) {
      alert("No se puede registrar una venta con un carrito vacío.");
      return; // Salir de la función si el carrito está vacío
    }

    setIsSubmitting(true); // Deshabilitar el botón al inicio del proceso

    const fechaVenta = new Date();
    const totalVenta = carrito.reduce(
      (total, producto) => total + producto.precioProducto * producto.cantidad,
      0
    );

    const productosVenta = carrito.map((producto) => ({
      idProducto: producto.id,
      nombreProducto: producto.nombreProducto,
      marcaProducto: producto.marcaProducto,
      categoriaProducto: producto.categoriaProducto,
      precioProducto: producto.precioProducto ?? 0,
      precioOriginal: producto.precioOriginal ?? 0,
      cantidad: producto.cantidad,
      cantidadProducto: producto.cantidadProducto,
    }));

    const identifyUser = auth.currentUser;

    try {
      await addDoc(collection(db, "sales"), {
        fechaVenta,
        totalVenta,
        totalGanancia,
        tipoPago,
        idUsuario: identifyUser.uid,
        productos: productosVenta,
      });

      const batch = writeBatch(db);
      carrito.forEach((producto) => {
        const productoRef = doc(db, "productos", producto.id);
        batch.update(productoRef, {
          cantidadProducto: producto.cantidadProducto - producto.cantidad,
        });
      });
      await batch.commit();

      setCarrito([]);
      alert("Venta registrada con éxito");
    } catch (error) {
      setError("Error al registrar la venta");
      console.error("Error al registrar la venta:", error);
    } finally {
      setIsSubmitting(false); // Rehabilitar el botón al finalizar el proceso
    }
  };

  const formatoDinero = (amount) => {
    if (amount == null) {
      return "0";
    }
    return `${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
  };

  const totalProductos = carrito.reduce((total, producto) => total + producto.cantidad, 0);
  const totalMonto = carrito.reduce((total, producto) => total + producto.precioProducto * producto.cantidad, 0);

  const totalGanancia = carrito.reduce((total, producto) => {
    const precioProducto = producto.precioProducto ?? 0;
    const precioOriginal = producto.precioOriginal ?? 0;
  
    const gananciaPorProducto = precioOriginal === 0 ? 0 : (precioProducto - precioOriginal) * producto.cantidad;
    
    return total + gananciaPorProducto;
  }, 0);

  if (loading) {
    return (
      <div>
        <NavbarAdmin />
        <h1>Cargando productos...</h1>
      </div>
    );
  }

  return (
    <div>
      <div className="nav">
        <NavbarAdmin />
      </div>
      <main className="main1">
        <div className="layout">
          {/* Columna izquierda */}
          <div className="columna-izquierda">
            <div className="carrito-label">
              <p className="form-title">Carrito de compras</p>
              <div className="encabezado">
                <input
                  className="carrito-input"
                  type="text"
                  placeholder="Buscar producto por ID..."
                  value={idProductoBuscado}
                  onChange={filtrarInventario}
                  onBlur={() => {
                    if (idProductoBuscado.length > 0) {
                      const productoEncontrado = productos.find(
                        (producto) => String(producto.id) === idProductoBuscado
                      );
                      if (productoEncontrado) {
                        agregarAlCarrito(productoEncontrado);
                        setIdProductoBuscado("");
                      } else {
                        setError("Producto no encontrado.");
                      }
                    }
                  }}
                />
                <input
                  className="carrito-input"
                  type="number"
                  placeholder="Cantidad..."
                  value={cantidadBuscada}
                  min="1"
                  onChange={(e) => {
                    const valor = parseInt(e.target.value);
                    setCantidadBuscada(valor < 1 ? 1 : valor);
                  }}
                />
              </div>
              <label className="textp" htmlFor="tipoPago">Tipo de pago:</label>
              <select
                id="tipoPago"
                value={tipoPago}
                onChange={handleTipoPagoChange}
                className="carrito-input"
              >
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
              </select>

              {error && <p className="error">{error}</p>}

              <div className="pago">
                <p className="textp">Total productos: {totalProductos}</p>
                <br />
                <p className="textp">Total ganancia: ${formatoDinero(totalGanancia)}</p> {/* Mostrar ganancia total */}
                <br />
                <p className="textp">Total monto: ${formatoDinero(totalMonto)}</p>
                {tipoPago === "efectivo" && (
                  <div>
                    <label className="textp" htmlFor="cantidadEntregada">Cantidad entregada:</label>
                    <input
                      id="cantidadEntregada"
                      type="number"
                      value={cantidadEntregada}
                      onChange={handleCantidadEntregadaChange}
                      className="carrito-input"
                    />
                    <p className="textp">Vuelto: ${formatoDinero(vuelto)}</p>
                  </div>
                )}
              </div>


              <button className="boton-venta" onClick={handleSubmit} disabled={isSubmitting}>
                <span>{isSubmitting ? "Procesando..." : "Finalizar Venta"}</span>
              </button>
            </div>
          </div>

          {/* Columna derecha */}
          <div className="columna-derecha" style={{ height: '90vh'}}>
            <section className="" style={{ maxHeight: '80vh'}}>
              <table className="carrito-tabla" >
                <thead className="carrito-th">
                  <tr className="carrito-tr">
                    <th className="carrito-th">Producto</th>
                    <th className="carrito-th">Precio</th>
                    <th className="carrito-th">Precio Original</th> {/* Nueva columna */}
                    <th className="carrito-th">Cantidad</th>
                    <th className="carrito-th">Stock</th>
                    <th className="carrito-th">Total</th>
                    <th className="carrito-th">Acciones</th>
                  </tr>
                </thead>
                <tbody className="carrito-items">
                  {carrito.map((producto) => (
                    <tr className="carrito-tr" key={producto.id}>
                      <td className="carrito-td">
                        <p className="txt-carrito">{producto.nombreProducto}</p>
                      </td>
                      <td className="carrito-td">
                        <p className="txt-carrito">
                          ${formatoDinero(producto.precioProducto)}
                        </p>
                      </td>
                      <td className="carrito-td">
                        <p className="txt-carrito">
                          ${formatoDinero(producto.precioOriginal)}
                        </p>
                      </td> {/* Mostrar precioOriginal */}
                      <td className="carrito-td">
                        <p className="txt-carrito">
                          <button
                            className="boton-resta"
                            onClick={() =>
                              decrementarCantidad(producto.id)
                            }
                          >
                            <FontAwesomeIcon icon={faMinus} />
                          </button>
                          {producto.cantidad}
                          <button
                            className="boton-suma"
                            onClick={() =>
                              incrementarCantidad(producto.id)
                            }
                          >
                            <FontAwesomeIcon icon={faPlus} />
                          </button>
                        </p>
                      </td>
                      
                      <td>
                        <p
                          className={
                            (producto.stockDisponible || 0) <= 5
                              ? "cantidad-baja"
                              : (producto.stockDisponible || 0) <= 15
                              ? "cantidad-media"
                              : "cantidad-alta"
                          }
                        >
                          {producto.stockDisponible || 0}
                        </p>
                      </td>

                      <td className="carrito-td">
                        <p className="txt-carrito">
                          $
                          {formatoDinero(
                            producto.precioProducto * producto.cantidad
                          )}
                        </p>
                      </td>
                      <td className="carrito-td">
                        <button
                          className="boton-eliminar"
                          onClick={() => eliminarDelCarrito(producto.id)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Ventas;
