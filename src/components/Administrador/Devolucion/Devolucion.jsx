import React, { useEffect, useState } from "react";
import NavbarAdmin from "../NavbarAdmin";
import "../../../styles/ventas.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
import { db, auth } from "../../../firebase";
import {
  collection,
  doc,
  getDocs,
  addDoc,
  writeBatch,
} from "firebase/firestore";

const Devolucion = () => {
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState("");
  const [carrito, setCarrito] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tipoPago, setTipoPago] = useState("efectivo");
  const [idProductoBuscado, setIdProductoBuscado] = useState("");
  const [cantidadBuscada, setCantidadBuscada] = useState(1);
  const [isReturn, setIsReturn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const getProductos = async () => {
      try {
        const productosRef = collection(db, "productos");
        const snapshot = await getDocs(productosRef);
        const productosList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        if (isMounted) {
          setProductos(productosList);
        }
      } catch (error) {
        setError("Error al obtener los productos");
        console.error("Error al obtener los productos:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getProductos();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (idProductoBuscado.length > 0) {
      const productoEncontrado = productos.find(
        (producto) => String(producto.idProducto) === idProductoBuscado
      );

      if (productoEncontrado) {
        if (isReturn) {
          agregarDevolucion(productoEncontrado, cantidadBuscada);
        } else {
          agregarAlCarrito(productoEncontrado, cantidadBuscada);
        }
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
  }, [idProductoBuscado, productos, cantidadBuscada, isReturn]);

  const filtrarInventario = (e) => {
    setIdProductoBuscado(e.target.value);
  };

  const agregarAlCarrito = (producto, cantidad) => {
    setCarrito((prevCarrito) => {
      const productoExistente = prevCarrito.find(
        (item) => item.idProducto === producto.idProducto
      );
      if (productoExistente) {
        return prevCarrito.map((item) =>
          item.idProducto === producto.idProducto
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        );
      } else {
        return [...prevCarrito, { ...producto, cantidad }];
      }
    });
  };

  const agregarDevolucion = (producto, cantidad) => {
    setCarrito((prevCarrito) => {
      const productoExistente = prevCarrito.find(
        (item) => item.idProducto === producto.idProducto
      );
      if (productoExistente) {
        return prevCarrito.map((item) =>
          item.idProducto === producto.idProducto
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        );
      } else {
        return [...prevCarrito, { ...producto, cantidad }];
      }
    });
  };

  const incrementarCantidad = (idProducto) => {
    setCarrito((prevCarrito) =>
      prevCarrito.map((item) =>
        item.idProducto === idProducto
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      )
    );
  };

  const decrementarCantidad = (idProducto) => {
    setCarrito((prevCarrito) =>
      prevCarrito.map((producto) =>
        producto.idProducto === idProducto
          ? { ...producto, cantidad: Math.max(1, producto.cantidad - 1) }
          : producto
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const fechaVenta = new Date();
    const identifyUser = auth.currentUser;

    try {
      const totalVenta = carrito.reduce(
        (total, producto) =>
          total + producto.precioProducto * producto.cantidad,
        0
      );

      const productosVenta = carrito.map((producto) => ({
        idProducto: producto.idProducto,
        nombreProducto: producto.nombreProducto,
        marcaProducto: producto.marcaProducto,
        categoriaProducto: producto.categoriaProducto,
        precioProducto: producto.precioProducto,
        cantidad: producto.cantidad,
      }));

      const idUsuario = identifyUser ? identifyUser.uid : "";

      await addDoc(collection(db, "sales"), {
        fechaVenta,
        totalVenta: -totalVenta,
        idUsuario,
        productos: productosVenta,
      });

      const batch = writeBatch(db);
      carrito.forEach((producto) => {
        const productoRef = doc(db, "productos", producto.idProducto);
        const nuevaCantidad = producto.cantidadProducto + producto.cantidad;
        batch.update(productoRef, {
          cantidadProducto: nuevaCantidad,
        });
      });

      await batch.commit();

      setCarrito([]);
      setIdProductoBuscado("");
      setCantidadBuscada(1);
      setIsSubmitting(false);
      alert("Operación realizada con éxito");
    } catch (error) {
      setError("Error al registrar la operación");
      console.error("Error al registrar la operación:", error);
      setIsSubmitting(false);
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
      <NavbarAdmin />
      <main className="main1">
        <div className="carrito-label">
          <p className="form-title">Devolución</p>
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
                    (producto) =>
                      String(producto.idProducto) === idProductoBuscado
                  );
                  if (productoEncontrado) {
                    if (isReturn) {
                      agregarDevolucion(productoEncontrado, cantidadBuscada);
                    } else {
                      agregarAlCarrito(productoEncontrado, cantidadBuscada);
                    }
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
                const valor = parseInt(e.target.value, 10);
                setCantidadBuscada(valor < 1 ? 1 : valor);
              }}
            />
          </div>

          <table className="carrito-tabla">
            <thead className="carrito-th">
              <tr className="carrito-tr">
                <th className="carrito-th">Producto</th>
                <th className="carrito-th">Precio</th>
                <th className="carrito-th">Cantidad</th>
                <th className="carrito-th">Total</th>
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
                      -${formatoDinero(producto.precioProducto)}
                    </p>
                  </td>
                  <td className="carrito-td">
                    <p className="txt-carrito">
                      <button
                        className="boton-resta"
                        onClick={() => decrementarCantidad(producto.idProducto)}
                      >
                        <FontAwesomeIcon icon={faMinus} />
                      </button>
                      <span className="spanCarrito">{producto.cantidad}</span>
                      <button
                        className="boton-suma"
                        onClick={() => incrementarCantidad(producto.idProducto)}
                      >
                        <FontAwesomeIcon icon={faPlus} />
                      </button>
                    </p>
                  </td>
                  <td className="carrito-td">
                    <p className="txt-carrito">
                      -$
                      {formatoDinero(
                        producto.precioProducto * producto.cantidad
                      )}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="venta-label">
            <div className="totalcarro">
              <p className="textp">
                Total a Devolver: -$
                {formatoDinero(
                  carrito.reduce(
                    (acc, item) => acc + item.cantidad * item.precioProducto,
                    0
                  )
                )}
              </p>
            </div>
          </div>

          <div className="bottom-container">
            <button
              className="boton-venta"
              onClick={handleSubmit}
              disabled={carrito.length === 0}
            >
              <span>Devolución</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Devolucion;
