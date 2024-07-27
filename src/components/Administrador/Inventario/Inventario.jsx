import React, { useEffect, useState } from "react";
import NavbarAdmin from "../NavbarAdmin";
import { Dialog } from "@mui/material";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import "../../../styles/inventario.css";
import "../../../styles/ventas.css";

// Configura Firestore
const db = getFirestore();

const Inventario = () => {
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState("");
  const [inventarioFiltrado, setInventarioFiltrado] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [productoEditado, setProductoEditado] = useState(null);
  const [formData, setFormData] = useState({
    idProducto: "",
    nombreProducto: "",
    precioProducto: "",
    categoriaProducto: "",
    marcaProducto: "",
    cantidadProducto: "",
  });

  useEffect(() => {
    const getProductos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsArray = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (Array.isArray(productsArray)) {
          setProductos(productsArray);
          setInventarioFiltrado(productsArray);
        } else {
          setError("Datos de productos no son un array.");
        }
      } catch (error) {
        setError("Error al obtener los productos");
        console.error("Error al obtener los productos:", error);
      } finally {
        setLoading(false);
      }
    };

    getProductos();
  }, []);

  const filtrarInventario = (e) => {
    const texto = e.target.value.toLowerCase();

    if (texto === "") {
      setInventarioFiltrado(productos);
    } else {
      const inventarioFiltrados = productos.filter((producto) => {
        const idProductoLowerCase = String(producto.idProducto).toLowerCase();
        const nombreProductoLowerCase = String(
          producto.nombreProducto
        ).toLowerCase();
        const precioProductoLowerCase = String(
          producto.precioProducto
        ).toLowerCase();
        const categoriaProductoLowerCase = String(
          producto.categoriaProducto
        ).toLowerCase();
        const marcaProductoLowerCase = String(
          producto.marcaProducto
        ).toLowerCase();
        const cantidadProductoLowerCase = String(
          producto.cantidadProducto
        ).toLowerCase();

        return (
          idProductoLowerCase.includes(texto) ||
          nombreProductoLowerCase.includes(texto) ||
          precioProductoLowerCase.includes(texto) ||
          categoriaProductoLowerCase.includes(texto) ||
          marcaProductoLowerCase.includes(texto) ||
          cantidadProductoLowerCase.includes(texto)
        );
      });

      setInventarioFiltrado(inventarioFiltrados);
    }
  };

  const formatoDinero = (amount) => {
    return `${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
  };

  const handleEditClick = (producto) => {
    setProductoEditado(producto);
    setFormData({
      idProducto: producto.idProducto,
      nombreProducto: producto.nombreProducto,
      precioProducto: producto.precioProducto,
      categoriaProducto: producto.categoriaProducto,
      marcaProducto: producto.marcaProducto,
      cantidadProducto: producto.cantidadProducto,
    });
    setOpenModal(true); // Abrir el modal cuando se selecciona un producto para editar
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setProductoEditado(null); // Restablecer el producto editado cuando se cierra el modal
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      const productRef = doc(db, "products", formData.idProducto);
      await updateDoc(productRef, {
        nombreProducto: formData.nombreProducto,
        precioProducto: Number(formData.precioProducto),
        categoriaProducto: formData.categoriaProducto,
        marcaProducto: formData.marcaProducto,
        cantidadProducto: Number(formData.cantidadProducto),
      });

      setProductos((prevProductos) =>
        prevProductos.map((producto) => {
          if (producto.idProducto === productoEditado.idProducto) {
            return {
              ...producto,
              ...formData,
            };
          }
          return producto;
        })
      );

      setInventarioFiltrado((prevInventario) =>
        prevInventario.map((producto) => {
          if (producto.idProducto === productoEditado.idProducto) {
            return {
              ...producto,
              ...formData,
            };
          }
          return producto;
        })
      );

      handleCloseModal(); // Cerrar el modal y restablecer el estado cuando se actualiza el producto
    } catch (error) {
      console.error("Error al actualizar el producto:", error);
    }
  };

  // Calcular el total de productos
  const totalProductos = inventarioFiltrado.reduce((total, producto) => {
    return total + producto.cantidadProducto;
  }, 0);

  // Calcular el total del inventario
  const totalInventario = inventarioFiltrado.reduce((total, producto) => {
    return total + producto.precioProducto * producto.cantidadProducto;
  }, 0);

  if (loading) return <p>Cargando productos...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <div className="nav">
        <NavbarAdmin />
      </div>
      <div className="body-tabla">
        <main className="table">
          <section className="table-header">
            <p className="form-title">
              Total del Inventario: ${formatoDinero(totalInventario)}
            </p>
            <p className="form-title">Total de productos: {totalProductos}</p>
            <input
              className="buscar"
              type="text"
              placeholder="Buscar producto"
              onChange={filtrarInventario}
            />
          </section>
          <section className="table-body">
            <table className="tabla-inventario">
              <thead>
                <tr>
                  <th>Codigo</th>
                  <th>Nombre</th>
                  <th>Precio</th>
                  <th>Categoria</th>
                  <th>Marca</th>
                  <th>Cantidad</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {inventarioFiltrado.length > 0 ? (
                  inventarioFiltrado.map((producto) => (
                    <tr key={producto.idProducto}>
                      <td>{producto.idProducto}</td>
                      <td>{producto.nombreProducto}</td>
                      <td>{formatoDinero(producto.precioProducto)}</td>
                      <td>{producto.categoriaProducto}</td>
                      <td>{producto.marcaProducto}</td>
                      <td>
                        <p
                          className={
                            producto.cantidadProducto <= 5
                              ? "cantidad-baja"
                              : producto.cantidadProducto <= 15
                              ? "cantidad-media"
                              : "cantidad-alta"
                          }
                        >
                          {producto.cantidadProducto}
                        </p>
                      </td>
                      <td>
                        <button
                          className="btn-editar"
                          onClick={() => handleEditClick(producto)}
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7">No hay productos disponibles</td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        </main>

        <Dialog open={openModal} onClose={handleCloseModal}>
          {productoEditado && (
            <div className="formulario-editar">
              <p className="form-title">Editar Producto </p>
              <form onSubmit={handleFormSubmit}>
                <label>
                  Nombre:
                  <input
                    type="text"
                    name="nombreProducto"
                    value={formData.nombreProducto}
                    onChange={handleInputChange}
                  />
                </label>
                <label>
                  Precio:
                  <input
                    type="number"
                    name="precioProducto"
                    value={formData.precioProducto}
                    onChange={handleInputChange}
                  />
                </label>
                <label>
                  Categoria:
                  <input
                    type="text"
                    name="categoriaProducto"
                    value={formData.categoriaProducto}
                    onChange={handleInputChange}
                  />
                </label>
                <label>
                  Marca:
                  <input
                    type="text"
                    name="marcaProducto"
                    value={formData.marcaProducto}
                    onChange={handleInputChange}
                  />
                </label>
                <label>
                  Cantidad:
                  <input
                    type="number"
                    name="cantidadProducto"
                    value={formData.cantidadProducto}
                    onChange={handleInputChange}
                  />
                </label>
                <button type="submit">Actualizar Producto</button>
                <button type="button" onClick={handleCloseModal}>
                  Cancelar
                </button>
              </form>
            </div>
          )}
        </Dialog>
      </div>
    </div>
  );
};

export default Inventario;
