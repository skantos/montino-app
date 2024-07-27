import "../../../styles/agregarProducto.css";
import React, { useState } from "react";
import NavbarAdmin from "../NavbarAdmin";
import { db } from "../../../firebase"; // Ajusta la ruta según tu configuración
import { doc, getDoc, setDoc } from "firebase/firestore";

const AgregarProducto = () => {
  const [idProducto, setIdProducto] = useState("");
  const [nombreProducto, setNombreProducto] = useState("");
  const [precioProducto, setPrecioProducto] = useState("");
  const [categoriaProducto, setCategoriaProducto] = useState("");
  const [marcaProducto, setMarcaProducto] = useState("");
  const [cantidadProducto, setCantidadProducto] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const checkProductExists = async () => {
    try {
      const productDoc = doc(db, "productos", idProducto);
      const productSnap = await getDoc(productDoc);
      return productSnap.exists(); // Product exists
    } catch (error) {
      console.error("Error checking product existence:", error);
      setError("Error al verificar la existencia del producto");
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if product already exists
    const productExists = await checkProductExists();
    if (productExists) {
      setError("El producto ya está registrado");
      return;
    }

    try {
      const productDoc = doc(db, "productos", idProducto);
      await setDoc(productDoc, {
        idProducto,
        nombreProducto,
        precioProducto,
        categoriaProducto,
        marcaProducto,
        cantidadProducto,
      });

      setSuccess("Producto registrado exitosamente");
      setIdProducto("");
      setNombreProducto("");
      setPrecioProducto("");
      setCategoriaProducto("");
      setMarcaProducto("");
      setCantidadProducto("");
      setError("");
    } catch (error) {
      setError("Hubo un error al registrar el producto");
      console.error("Error al registrar el producto:", error);
    }
  };

  return (
    <>
      <div className="nav">
        <NavbarAdmin />
      </div>
      <div>
        <div className="productos-box">
          <p className="form-title">Ingresar Producto</p>
          <form className="form-producto" onSubmit={handleSubmit}>
            <div className="detalle">
              <div className="input-producto">
                <p>Código Producto</p>
                <input
                  type="text"
                  placeholder="Id Producto"
                  value={idProducto}
                  onChange={(e) => setIdProducto(e.target.value)}
                  required
                />
              </div>
              <div className="input-producto">
                <p>Nombre producto</p>
                <input
                  type="text"
                  placeholder="Nombre Producto"
                  value={nombreProducto}
                  onChange={(e) => setNombreProducto(e.target.value)}
                  required
                />
              </div>
              <div className="input-producto">
                <p>Precio Producto</p>
                <input
                  type="text"
                  placeholder="Precio Producto"
                  value={precioProducto}
                  onChange={(e) => setPrecioProducto(e.target.value)}
                  required
                />
              </div>
              <div className="input-producto">
                <p>Categoria Producto</p>
                <input
                  type="text"
                  placeholder="Categoria Producto"
                  value={categoriaProducto}
                  onChange={(e) => setCategoriaProducto(e.target.value)}
                  required
                />
              </div>
              <div className="input-producto">
                <p>Marca Producto</p>
                <input
                  type="text"
                  placeholder="Marca Producto"
                  value={marcaProducto}
                  onChange={(e) => setMarcaProducto(e.target.value)}
                  required
                />
              </div>
              <div className="input-producto">
                <p>Cantidad Producto</p>
                <input
                  type="text"
                  placeholder="Cantidad Producto"
                  value={cantidadProducto}
                  onChange={(e) => setCantidadProducto(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && <p className="form-title">{error}</p>}
            {success && <p className="form-title">{success}</p>}

            <button className="submit" type="submit">
              Agregar Producto
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AgregarProducto;
