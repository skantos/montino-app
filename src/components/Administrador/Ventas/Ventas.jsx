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
          return [...prevCarrito, { ...producto, cantidad }];
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
          ? { ...producto, cantidad: Math.max(1, producto.cantidad - 1) }
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
      precioProducto: producto.precioProducto,
      cantidad: producto.cantidad,
      cantidadProducto: producto.cantidadProducto,
    }));

    const identifyUser = auth.currentUser;

    try {
      await addDoc(collection(db, "sales"), {
        fechaVenta,
        totalVenta,
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
    }
  };

  const formatoDinero = (amount) => {
    return `${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
  };

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
        <div className="carrito-label">
          <p className="form-title">Carrito de compras</p>
          <hr />
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

          {error && <p className="error">{error}</p>}

          <section className="tabla-ventas">
            <table className="carrito-tabla">
              <thead className="carrito-th">
                <tr className="carrito-tr">
                  <th className="carrito-th">Producto</th>
                  <th className="carrito-th">Precio</th>
                  <th className="carrito-th">Cantidad</th>
                  <th className="carrito-th">Total</th>
                  <th className="carrito-th">Acciones</th>
                </tr>
              </thead>
              <tbody className="carrito-items">
                {carrito.map((producto) => (
                  <tr className="carrito-tr" key={producto.idProducto}>
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
                        <button
                          className="boton-resta"
                          onClick={() =>
                            decrementarCantidad(producto.idProducto)
                          }
                        >
                          <FontAwesomeIcon icon={faMinus} />
                        </button>
                        {producto.cantidad}
                        <button
                          className="boton-suma"
                          onClick={() =>
                            incrementarCantidad(producto.idProducto)
                          }
                        >
                          <FontAwesomeIcon icon={faPlus} />
                        </button>
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
                        onClick={() => eliminarDelCarrito(producto.idProducto)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <div className="pago">
            <label htmlFor="tipoPago">Tipo de pago:</label>
            <select
              id="tipoPago"
              value={tipoPago}
              onChange={handleTipoPagoChange}
              className="carrito-input"
            >
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
            </select>
            {tipoPago === "efectivo" && (
              <div>
                <label htmlFor="cantidadEntregada">Cantidad entregada:</label>
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

          <button className="boton-venta" onClick={handleSubmit}>
            <span>Finalizar Venta</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default Ventas;
