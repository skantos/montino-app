import "../../../styles/agregarProducto.css";
import React, { useState } from "react";
import NavbarAdmin from "../NavbarAdmin";
import { db } from "../../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const AgregarProducto = () => {
  const [idProducto, setIdProducto] = useState("");
  const [nombreProducto, setNombreProducto] = useState("");
  const [precioProducto, setPrecioProducto] = useState("");
  const [precioOriginal, setPrecioOriginal] = useState("");
  const [categoriaProducto, setCategoriaProducto] = useState("");
  const [marcaProducto, setMarcaProducto] = useState("");
  const [cantidadProducto, setCantidadProducto] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const checkProductExists = async () => {
    try {
      const productDoc = doc(db, "productos", idProducto);
      const productSnap = await getDoc(productDoc);
      return productSnap.exists();
    } catch (error) {
      console.error("Error checking product existence:", error);
      setError("Error al verificar la existencia del producto");
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar que todos los campos numéricos sean positivos enteros
    if (isNaN(precioProducto) || isNaN(precioOriginal) || isNaN(cantidadProducto)) {
      setError("Todos los campos de precio y cantidad deben ser números válidos.");
      return;
    }

    const precioProductoNum = Number(precioProducto);
    const precioOriginalNum = Number(precioOriginal);
    const cantidadProductoNum = Number(cantidadProducto);

    if (precioProductoNum <= 0 || precioOriginalNum < 0 || cantidadProductoNum <= 0) {
      setError("Precio Producto y Cantidad Producto deben ser números positivos. Precio Original puede ser 0 o positivo.");
      return;
    }

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
        precioProducto: precioProductoNum,
        precioOriginal: precioOriginalNum,
        categoriaProducto,
        marcaProducto,
        cantidadProducto: cantidadProductoNum,
      });

      setSuccess("Producto registrado exitosamente");
      setIdProducto("");
      setNombreProducto("");
      setPrecioProducto("");
      setPrecioOriginal("");
      setCategoriaProducto("");
      setMarcaProducto("");
      setCantidadProducto("");
      setError("");
    } catch (error) {
      setError("Hubo un error al registrar el producto");
      console.error("Error al registrar el producto:", error);
    }
  };

  const handleChange = (setter) => (e) => {
    // Asegurarse de que solo se ingresen números enteros positivos
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setter(value);
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
                  type="number"
                  placeholder="Precio Producto"
                  value={precioProducto}
                  onChange={handleChange(setPrecioProducto)}
                  min="0"
                  step="1"
                  required
                />
              </div>
              <div className="input-producto">
                <p>Precio Original</p>
                <input
                  type="number"
                  placeholder="Precio Original"
                  value={precioOriginal}
                  onChange={handleChange(setPrecioOriginal)}
                  min="0"
                  step="1"
                />
              </div>
              <div className="input-producto">
                <p>Categoria Producto</p>
                <input
                  type="text"
                  placeholder="Categoria Producto"
                  value={categoriaProducto}
                  onChange={(e) => setCategoriaProducto(e.target.value)}
                />
              </div>
              <div className="input-producto">
                <p>Marca Producto</p>
                <input
                  type="text"
                  placeholder="Marca Producto"
                  value={marcaProducto}
                  onChange={(e) => setMarcaProducto(e.target.value)}
                />
              </div>
              <div className="input-producto">
                <p>Cantidad Producto</p>
                <input
                  type="number"
                  placeholder="Cantidad Producto"
                  value={cantidadProducto}
                  onChange={handleChange(setCantidadProducto)}
                  min="1"
                  step="1"
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
