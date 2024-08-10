import React, { useEffect, useState } from "react";
import NavbarAdmin from "../NavbarAdmin";
import { Dialog } from "@mui/material";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import "../../../styles/inventario.css";
import "../../../styles/ventas.css";
import { db } from "../../../firebase";
import { deleteDoc } from "firebase/firestore";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus, faTrash } from "@fortawesome/free-solid-svg-icons";

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
    precioOriginal: "", // Nuevo campo para precio original
    categoriaProducto: "",
    marcaProducto: "",
    cantidadProducto: "",
  });

  useEffect(() => {
    const getProductos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "productos"));
        const productsArray = querySnapshot.docs.map((doc) => ({
          idProducto: doc.id,
          ...doc.data(),
        }));

        setProductos(productsArray);
        setInventarioFiltrado(productsArray);
      } catch (error) {
        setError("Error al cargar los productos. Intente más tarde.");
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
        const nombreProductoLowerCase = String(producto.nombreProducto).toLowerCase();
        const precioProductoLowerCase = String(producto.precioProducto).toLowerCase();
        const categoriaProductoLowerCase = String(producto.categoriaProducto).toLowerCase();
        const marcaProductoLowerCase = String(producto.marcaProducto).toLowerCase();
        const cantidadProductoLowerCase = String(producto.cantidadProducto).toLowerCase();

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
    const amountNumber = isNaN(amount) ? 0 : Number(amount);
    return `${amountNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
  };

  const handleEditClick = (producto) => {
    setProductoEditado(producto);
    setFormData({
      idProducto: producto.idProducto,
      nombreProducto: producto.nombreProducto,
      precioProducto: producto.precioProducto || 0, // Asegura que sea un número
      precioOriginal: producto.precioOriginal || 0, // Asegura que sea un número
      categoriaProducto: producto.categoriaProducto,
      marcaProducto: producto.marcaProducto,
      cantidadProducto: producto.cantidadProducto || 0, // Asegura que sea un número
    });
    setOpenModal(true);
  };


  const handleDeleteClick = async (producto) => {
    // Mostrar confirmación antes de eliminar
    if (window.confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      try {
        // Elimina el documento del inventario
        const productRef = doc(db, "productos", producto.idProducto);
        await deleteDoc(productRef);
  
        // Actualiza el estado para reflejar la eliminación
        setProductos((prevProductos) =>
          prevProductos.filter((p) => p.idProducto !== producto.idProducto)
        );
        setInventarioFiltrado((prevInventario) =>
          prevInventario.filter((p) => p.idProducto !== producto.idProducto)
        );
  
        alert("Producto eliminado exitosamente");
      } catch (error) {
        console.error("Error al eliminar el producto:", error);
        alert("Error al eliminar el producto. Intente de nuevo.");
      }
    }
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
    setProductoEditado(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      const productRef = doc(db, "productos", formData.idProducto);
      await updateDoc(productRef, {
        nombreProducto: formData.nombreProducto,
        precioProducto: Number(formData.precioProducto) || 0,
        precioOriginal: Number(formData.precioOriginal) || 0,
        categoriaProducto: formData.categoriaProducto,
        marcaProducto: formData.marcaProducto,
        cantidadProducto: Number(formData.cantidadProducto) || 0,
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

      handleCloseModal();
    } catch (error) {
      console.error("Error al actualizar el producto:", error);
    }
  };

  const totalProductos = inventarioFiltrado.reduce((total, producto) => {
    return total + (producto.cantidadProducto || 0);
  }, 0);

  const totalInventario = inventarioFiltrado.reduce((total, producto) => {
    return total + (producto.precioProducto || 0) * (producto.cantidadProducto || 0);
  }, 0);

  const totalOriginal = inventarioFiltrado.reduce((total, producto) => {
    const precioOriginal = isNaN(producto.precioOriginal) ? 0 : Number(producto.precioOriginal);
    const cantidad = isNaN(producto.cantidadProducto) ? 0 : Number(producto.cantidadProducto);
    return total + precioOriginal * cantidad;
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
            <p className="form-title">
              Total Original: ${formatoDinero(totalOriginal)}
            </p>
            <div className="container-input">
              <input type="text" placeholder="Buscar producto" name="text" className="input" onChange={filtrarInventario}/>
              <svg fill="#000000" width="20px" height="20px" viewBox="0 0 1920 1920" xmlns="http://www.w3.org/2000/svg">
                <path d="M790.588 1468.235c-373.722 0-677.647-303.924-677.647-677.647 0-373.722 303.925-677.647 677.647-677.647 373.723 0 677.647 303.925 677.647 677.647 0 373.723-303.924 677.647-677.647 677.647Zm596.781-160.715c120.396-138.692 193.807-319.285 193.807-516.932C1581.176 354.748 1226.428 0 790.588 0S0 354.748 0 790.588s354.748 790.588 790.588 790.588c197.647 0 378.24-73.411 516.932-193.807l516.028 516.142 79.963-79.963-516.142-516.028Z" fillRule="evenodd"></path>
              </svg>
            </div>
          </section>
          <section className="table-body">
            <table className="tabla-inventario">
              <thead>
                <tr>
                  <th>Codigo</th>
                  <th>Nombre</th>
                  <th>Precio</th>
                  <th>Precio Original</th> {/* Nueva columna para Precio Original */}
                  <th>Ganancias</th> {/* Nueva columna para Ganancias */}
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
                      <td>{formatoDinero(producto.precioProducto || 0)}</td>
                      <td>{formatoDinero(producto.precioOriginal || 0)}</td>
                      <td>{formatoDinero(((producto.precioProducto || 0) - (producto.precioOriginal || 0)))}</td> 
                      <td>{producto.categoriaProducto}</td>
                      <td>{producto.marcaProducto}</td>
                      <td>
                        <p
                          className={
                            (producto.cantidadProducto || 0) <= 5
                              ? "cantidad-baja"
                              : (producto.cantidadProducto || 0) <= 15
                              ? "cantidad-media"
                              : "cantidad-alta"
                          }
                        >
                          {producto.cantidadProducto || 0}
                        </p>
                      </td>
                      <td className="td-editar">
                        <button
                          className="btn-editar"
                          onClick={() => handleEditClick(producto)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                          </button>
                        <button
                          className="btn-eliminar"
                          onClick={() => handleDeleteClick(producto)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9">No hay productos disponibles</td>
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
                  Precio Original:
                  <input
                    type="number"
                    name="precioOriginal"
                    value={formData.precioOriginal}
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
