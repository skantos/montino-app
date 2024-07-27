// // import React, { useEffect, useState, useContext } from "react";
// // import NavbarAdmin from "../NavbarAdmin";
// // import { AuthContext } from "../../../context/AuthContext";
// // import "../../../styles/ventas.css";
// // import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// // import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
// // import { db, auth } from "../../../firebase";

// // const Ventas = () => {
// //   const [productos, setProductos] = useState([]);
// //   const [error, setError] = useState("");
// //   const [carrito, setCarrito] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [tipoPago, setTipoPago] = useState("efectivo");
// //   const [idProductoBuscado, setIdProductoBuscado] = useState("");
// //   const [cantidadBuscada, setCantidadBuscada] = useState(1);

// //   const { auth } = useContext(AuthContext);
// //   const userId = auth?.user?.idUsuario || localStorage.getItem("userId");

// //   useEffect(() => {
// //     let isMounted = true;
// //     const getProductos = async () => {
// //       try {
// //         const response = await axios.get("/products/products");
// //         if (isMounted) {
// //           if (response.data.success && Array.isArray(response.data.products)) {
// //             setProductos(response.data.products);
// //           } else {
// //             setError("Datos de productos no son un array.");
// //           }
// //         }
// //       } catch (error) {
// //         setError("Error al obtener los productos");
// //         console.error("Error al obtener los productos:", error);
// //       } finally {
// //         if (isMounted) {
// //           setLoading(false);
// //         }
// //       }
// //     };

// //     getProductos();

// //     return () => {
// //       isMounted = false;
// //     };
// //   }, []);

// //   useEffect(() => {
// //     if (idProductoBuscado.length > 0) {
// //       const productoEncontrado = productos.find(
// //         (producto) => String(producto.idProducto) === idProductoBuscado
// //       );

// //       if (productoEncontrado) {
// //         agregarAlCarrito(productoEncontrado, cantidadBuscada);
// //         setIdProductoBuscado("");
// //         setCantidadBuscada(1);
// //       } else {
// //         setError("Producto no encontrado.");

// //         setTimeout(() => {
// //           setError("");
// //           setIdProductoBuscado("");
// //           setCantidadBuscada(1);
// //         }, 3000);
// //       }
// //     }
// //   }, [idProductoBuscado, productos, cantidadBuscada]);

// //   const filtrarInventario = (e) => {
// //     setIdProductoBuscado(e.target.value);
// //   };

// //   const agregarAlCarrito = (producto, cantidad) => {
// //     setCarrito((prevCarrito) => {
// //       const productoExistente = prevCarrito.find(
// //         (item) => item.idProducto === producto.idProducto
// //       );
// //       if (productoExistente) {
// //         return prevCarrito.map((item) =>
// //           item.idProducto === producto.idProducto
// //             ? { ...item, cantidad: item.cantidad + cantidad }
// //             : item
// //         );
// //       } else {
// //         return [...prevCarrito, { ...producto, cantidad }];
// //       }
// //     });
// //   };

// //   const incrementarCantidad = (idProducto) => {
// //     setCarrito((prevCarrito) =>
// //       prevCarrito.map((item) =>
// //         item.idProducto === idProducto
// //           ? { ...item, cantidad: item.cantidad + 1 }
// //           : item
// //       )
// //     );
// //   };

// //   const decrementarCantidad = (idProducto) => {
// //     setCarrito((prevCarrito) =>
// //       prevCarrito.map((producto) =>
// //         producto.idProducto === idProducto
// //           ? { ...producto, cantidad: Math.max(1, producto.cantidad - 1) }
// //           : producto
// //       )
// //     );
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     const fechaVenta = new Date();
// //     const idUsers = userId;

// //     try {
// //       const totalVenta = -carrito.reduce(
// //         (total, producto) =>
// //           total + producto.precioProducto * producto.cantidad,
// //         0
// //       );

// //       const productosVenta = carrito.map((producto) => ({
// //         idProducto: producto.idProducto,
// //         cantidad: -Math.abs(producto.cantidad),
// //       }));

// //       const ventaResponse = await axios.post("/sales/sales", {
// //         fechaVenta,
// //         totalVenta,
// //         tipoPago,
// //         idUsers,
// //         productos: productosVenta,
// //       });

// //       if (!ventaResponse.data.success) {
// //         throw new Error("Error al registrar la venta");
// //       }

// //       for (const producto of carrito) {
// //         const devolucionResponse = await axios.post("/sales/processReturn", {
// //           idProducto: producto.idProducto,
// //           cantidad: Math.abs(producto.cantidad),
// //           tipoPago,
// //           idUsers,
// //         });

// //         if (!devolucionResponse.data.success) {
// //           throw new Error("Error al registrar la devolución");
// //         }
// //       }

// //       setCarrito([]);
// //       alert("Devoluciones registradas con éxito");
// //     } catch (error) {
// //       setError("Error al realizar la operación");
// //       console.error("Error al realizar la operación:", error);
// //     }
// //   };

// //   const formatoDinero = (amount) => {
// //     return `${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
// //   };

// //   if (loading) {
// //     return (
// //       <div>
// //         <NavbarAdmin />
// //         <h1>Cargando productos...</h1>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div>
// //       <NavbarAdmin />
// //       <main className="main1">
// //         <div className="carrito-label">
// //           <p className="form-title">Devolución</p>
// //           <hr />
// //           <div className="encabezado">
// //             <input
// //               className="carrito-input"
// //               type="text"
// //               placeholder="Buscar producto por ID..."
// //               value={idProductoBuscado}
// //               onChange={filtrarInventario}
// //               onBlur={() => {
// //                 if (idProductoBuscado.length > 0) {
// //                   const productoEncontrado = productos.find(
// //                     (producto) =>
// //                       String(producto.idProducto) === idProductoBuscado
// //                   );
// //                   if (productoEncontrado) {
// //                     agregarAlCarrito(productoEncontrado, cantidadBuscada);
// //                     setIdProductoBuscado("");
// //                   } else {
// //                     setError("Producto no encontrado.");
// //                   }
// //                 }
// //               }}
// //             />

// //             <input
// //               className="carrito-input"
// //               type="number"
// //               placeholder="Cantidad..."
// //               value={cantidadBuscada}
// //               min="1"
// //               onChange={(e) => {
// //                 const valor = parseInt(e.target.value, 10);
// //                 setCantidadBuscada(valor < 1 ? 1 : valor);
// //               }}
// //             />
// //           </div>

// //           <table className="carrito-tabla">
// //             <thead className="carrito-th">
// //               <tr className="carrito-tr">
// //                 <th className="carrito-th">Producto</th>
// //                 <th className="carrito-th">Precio</th>
// //                 <th className="carrito-th">Cantidad</th>
// //                 <th className="carrito-th">Total</th>
// //               </tr>
// //             </thead>
// //             <tbody className="carrito-items">
// //               {carrito.map((producto) => (
// //                 <tr className="carrito-tr" key={producto.idProducto}>
// //                   <td className="carrito-td">
// //                     <p className="txt-carrito">{producto.nombreProducto}</p>
// //                   </td>
// //                   <td className="carrito-td">
// //                     <p className="txt-carrito">
// //                       -${formatoDinero(producto.precioProducto)}
// //                     </p>
// //                   </td>
// //                   <td className="carrito-td">
// //                     <p className="txt-carrito">
// //                       <button
// //                         className="boton-resta"
// //                         onClick={() => decrementarCantidad(producto.idProducto)}
// //                       >
// //                         <FontAwesomeIcon icon={faMinus} />
// //                       </button>
// //                       <span className="spanCarrito">{producto.cantidad}</span>
// //                       <button
// //                         className="boton-suma"
// //                         onClick={() => incrementarCantidad(producto.idProducto)}
// //                       >
// //                         <FontAwesomeIcon icon={faPlus} />
// //                       </button>
// //                     </p>
// //                   </td>
// //                   <td className="carrito-td">
// //                     <p className="txt-carrito">
// //                       -$
// //                       {formatoDinero(
// //                         producto.precioProducto * producto.cantidad
// //                       )}
// //                     </p>
// //                   </td>
// //                 </tr>
// //               ))}
// //             </tbody>
// //           </table>

// //           <div className="venta-label">
// //             <div className="totalcarro">
// //               <p className="textp">
// //                 Total a Devolver: -$
// //                 {formatoDinero(
// //                   carrito.reduce(
// //                     (acc, item) => acc + item.cantidad * item.precioProducto,
// //                     0
// //                   )
// //                 )}
// //               </p>
// //             </div>
// //           </div>

// //           <div className="form-group-carrito">
// //             <form onSubmit={handleSubmit}>
// //               <button className="boton-venta" type="submit">
// //                 <span>Devolución</span>
// //               </button>
// //             </form>
// //           </div>
// //         </div>
// //       </main>
// //     </div>
// //   );
// // };

// // export default Ventas;

// import React, { useEffect, useState, useContext } from "react";
// import NavbarAdmin from "../NavbarAdmin";
// import { AuthContext } from "../../../context/AuthContext";
// import "../../../styles/ventas.css";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
// import { db, auth } from "../../../firebase";
// import {
//   collection,
//   doc,
//   getDocs,
//   addDoc,
//   updateDoc,
//   writeBatch,
// } from "firebase/firestore";

// const Devolucion = () => {
//   const [productos, setProductos] = useState([]);
//   const [error, setError] = useState("");
//   const [carrito, setCarrito] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [tipoPago, setTipoPago] = useState("efectivo");
//   const [idProductoBuscado, setIdProductoBuscado] = useState("");
//   const [cantidadBuscada, setCantidadBuscada] = useState(1);
//   const [isReturn, setIsReturn] = useState(false);

//   const { auth: authContext } = useContext(AuthContext);
//   const userId = authContext?.user?.idUsuario || localStorage.getItem("userId");

//   useEffect(() => {
//     let isMounted = true;
//     const getProductos = async () => {
//       try {
//         const productosRef = collection(db, "productos");
//         const snapshot = await getDocs(productosRef);
//         const productosList = snapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));
//         if (isMounted) {
//           setProductos(productosList);
//         }
//       } catch (error) {
//         setError("Error al obtener los productos");
//         console.error("Error al obtener los productos:", error);
//       } finally {
//         if (isMounted) {
//           setLoading(false);
//         }
//       }
//     };

//     getProductos();

//     return () => {
//       isMounted = false;
//     };
//   }, []);

//   useEffect(() => {
//     if (idProductoBuscado.length > 0) {
//       const productoEncontrado = productos.find(
//         (producto) => String(producto.idProducto) === idProductoBuscado
//       );

//       if (productoEncontrado) {
//         if (isReturn) {
//           agregarDevolucion(productoEncontrado, cantidadBuscada);
//         } else {
//           agregarAlCarrito(productoEncontrado, cantidadBuscada);
//         }
//         setIdProductoBuscado("");
//         setCantidadBuscada(1);
//       } else {
//         setError("Producto no encontrado.");

//         setTimeout(() => {
//           setError("");
//           setIdProductoBuscado("");
//           setCantidadBuscada(1);
//         }, 3000);
//       }
//     }
//   }, [idProductoBuscado, productos, cantidadBuscada, isReturn]);

//   const filtrarInventario = (e) => {
//     setIdProductoBuscado(e.target.value);
//   };

//   const agregarAlCarrito = (producto, cantidad) => {
//     setCarrito((prevCarrito) => {
//       const productoExistente = prevCarrito.find(
//         (item) => item.idProducto === producto.idProducto
//       );
//       if (productoExistente) {
//         return prevCarrito.map((item) =>
//           item.idProducto === producto.idProducto
//             ? { ...item, cantidad: item.cantidad + cantidad }
//             : item
//         );
//       } else {
//         return [...prevCarrito, { ...producto, cantidad }];
//       }
//     });
//   };

//   const agregarDevolucion = (producto, cantidad) => {
//     setCarrito((prevCarrito) => {
//       const productoExistente = prevCarrito.find(
//         (item) => item.idProducto === producto.idProducto
//       );
//       if (productoExistente) {
//         return prevCarrito.map((item) =>
//           item.idProducto === producto.idProducto
//             ? { ...item, cantidad: item.cantidad - cantidad }
//             : item
//         );
//       } else {
//         return [...prevCarrito, { ...producto, cantidad: -cantidad }];
//       }
//     });
//   };

//   const incrementarCantidad = (idProducto) => {
//     setCarrito((prevCarrito) =>
//       prevCarrito.map((item) =>
//         item.idProducto === idProducto
//           ? { ...item, cantidad: item.cantidad + 1 }
//           : item
//       )
//     );
//   };

//   const decrementarCantidad = (idProducto) => {
//     setCarrito((prevCarrito) =>
//       prevCarrito.map((producto) =>
//         producto.idProducto === idProducto
//           ? { ...producto, cantidad: Math.max(1, producto.cantidad - 1) }
//           : producto
//       )
//     );
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const fechaVenta = new Date();
//     const identifyUser = auth.currentUser;

//     try {
//       const totalVenta = carrito.reduce(
//         (total, producto) =>
//           total + producto.precioProducto * producto.cantidad,
//         0
//       );

//       const productosVenta = carrito.map((producto) => ({
//         idProducto: producto.idProducto,
//         nombreProducto: producto.nombreProducto,
//         marcaProducto: producto.marcaProducto,
//         categoriaProducto: producto.categoriaProducto,
//         precioProducto: producto.precioProducto,
//         cantidad: producto.cantidad,
//       }));

//       // Agregar la venta a la colección "sales" con el total negativo en caso de devolución
//       await addDoc(collection(db, "sales"), {
//         fechaVenta,
//         totalVenta: isReturn ? -totalVenta : totalVenta, // Total negativo si es devolución
//         tipoPago,
//         idUsuario: userId,
//         productos: productosVenta,
//       });

//       // Crear un batch de escritura para actualizar el inventario
//       const batch = writeBatch(db);
//       carrito.forEach((producto) => {
//         const productoRef = doc(db, "productos", producto.idProducto);
//         const nuevaCantidad =
//           producto.cantidad < 0
//             ? producto.cantidadProducto + Math.abs(producto.cantidad) // Incrementar la cantidad en caso de devolución
//             : producto.cantidadProducto - producto.cantidad; // Decrementar la cantidad en caso de venta
//         batch.update(productoRef, {
//           cantidadProducto: nuevaCantidad,
//         });
//       });

//       await batch.commit();

//       setCarrito([]);
//       alert("Operación realizada con éxito");
//     } catch (error) {
//       setError("Error al registrar la operación");
//       console.error("Error al registrar la operación:", error);
//     }
//   };

//   const formatoDinero = (amount) => {
//     return `${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
//   };

//   if (loading) {
//     return (
//       <div>
//         <NavbarAdmin />
//         <h1>Cargando productos...</h1>
//       </div>
//     );
//   }

//   return (
//     <div>
//       <NavbarAdmin />
//       <main className="main1">
//         <div className="carrito-label">
//           <p className="form-title">Venta / Devolución</p>
//           <hr />
//           <div className="encabezado">
//             <input
//               className="carrito-input"
//               type="text"
//               placeholder="Buscar producto por ID..."
//               value={idProductoBuscado}
//               onChange={filtrarInventario}
//               onBlur={() => {
//                 if (idProductoBuscado.length > 0) {
//                   const productoEncontrado = productos.find(
//                     (producto) =>
//                       String(producto.idProducto) === idProductoBuscado
//                   );
//                   if (productoEncontrado) {
//                     if (isReturn) {
//                       agregarDevolucion(productoEncontrado, cantidadBuscada);
//                     } else {
//                       agregarAlCarrito(productoEncontrado, cantidadBuscada);
//                     }
//                     setIdProductoBuscado("");
//                   } else {
//                     setError("Producto no encontrado.");
//                   }
//                 }
//               }}
//             />

//             <input
//               className="carrito-input"
//               type="number"
//               placeholder="Cantidad..."
//               value={cantidadBuscada}
//               min="1"
//               onChange={(e) => {
//                 const valor = parseInt(e.target.value, 10);
//                 setCantidadBuscada(valor < 1 ? 1 : valor);
//               }}
//             />
//           </div>

//           <table className="carrito-tabla">
//             <thead className="carrito-th">
//               <tr className="carrito-tr">
//                 <th className="carrito-th">Producto</th>
//                 <th className="carrito-th">Precio</th>
//                 <th className="carrito-th">Cantidad</th>
//                 <th className="carrito-th">Total</th>
//               </tr>
//             </thead>
//             <tbody className="carrito-items">
//               {carrito.map((producto) => (
//                 <tr className="carrito-tr" key={producto.idProducto}>
//                   <td className="carrito-td">
//                     <p className="txt-carrito">{producto.nombreProducto}</p>
//                   </td>
//                   <td className="carrito-td">
//                     <p className="txt-carrito">
//                       ${formatoDinero(producto.precioProducto)}
//                     </p>
//                   </td>
//                   <td className="carrito-td">
//                     <div className="control-cantidad">
//                       <button
//                         className="btn-control"
//                         onClick={() => decrementarCantidad(producto.idProducto)}
//                       >
//                         <FontAwesomeIcon icon={faMinus} />
//                       </button>
//                       <input
//                         className="input-cantidad"
//                         type="text"
//                         readOnly
//                         value={producto.cantidad}
//                       />
//                       <button
//                         className="btn-control"
//                         onClick={() => incrementarCantidad(producto.idProducto)}
//                       >
//                         <FontAwesomeIcon icon={faPlus} />
//                       </button>
//                     </div>
//                   </td>
//                   <td className="carrito-td">
//                     <p className="txt-carrito">
//                       $
//                       {formatoDinero(
//                         producto.precioProducto * producto.cantidad
//                       )}
//                     </p>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           <div className="total-carrito">
//             <div className="total">
//               <span>
//                 Total: $
//                 {formatoDinero(
//                   carrito.reduce(
//                     (total, producto) =>
//                       total + producto.precioProducto * producto.cantidad,
//                     0
//                   )
//                 )}
//               </span>
//             </div>
//           </div>

//           <form onSubmit={handleSubmit}>
//             <label htmlFor="tipoPago">Tipo de pago:</label>
//             <select
//               id="tipoPago"
//               value={tipoPago}
//               onChange={(e) => setTipoPago(e.target.value)}
//             >
//               <option value="efectivo">Efectivo</option>
//               <option value="tarjeta">Tarjeta</option>
//             </select>
//             <label htmlFor="isReturn">
//               <input
//                 id="isReturn"
//                 type="checkbox"
//                 checked={isReturn}
//                 onChange={(e) => setIsReturn(e.target.checked)}
//               />
//               Devolución
//             </label>
//             <button type="submit" className="btn-enviar">
//               Registrar Venta / Devolución
//             </button>
//           </form>

//           {error && <p className="error">{error}</p>}
//         </div>
//       </main>
//     </div>
//   );
// };

// export default Devolucion;
import React, { useEffect, useState, useContext } from "react";
import NavbarAdmin from "../NavbarAdmin";
import { AuthContext } from "../../../context/AuthContext";
import "../../../styles/ventas.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
import { db, auth } from "../../../firebase";
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
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

      await addDoc(collection(db, "sales"), {
        fechaVenta,
        totalVenta: isReturn ? -totalVenta : totalVenta,
        tipoPago,
        idUsuario: userId,
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
      alert("Operación realizada con éxito");
    } catch (error) {
      setError("Error al registrar la operación");
      console.error("Error al registrar la operación:", error);
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
          <p className="form-title">Venta / Devolución</p>
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
                  <td className="carrito-td">{producto.nombreProducto}</td>
                  <td className="carrito-td">
                    {formatoDinero(producto.precioProducto)}
                  </td>
                  <td className="carrito-td">
                    <button
                      className="button-quantity"
                      onClick={() => decrementarCantidad(producto.idProducto)}
                    >
                      <FontAwesomeIcon icon={faMinus} />
                    </button>
                    {producto.cantidad}
                    <button
                      className="button-quantity"
                      onClick={() => incrementarCantidad(producto.idProducto)}
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </td>
                  <td className="carrito-td">
                    {formatoDinero(producto.precioProducto * producto.cantidad)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="bottom-container">
            <select
              className="carrito-select"
              value={tipoPago}
              onChange={(e) => setTipoPago(e.target.value)}
            >
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
            </select>
            <button
              className="carrito-button"
              onClick={handleSubmit}
              disabled={carrito.length === 0}
            >
              {isReturn ? "Realizar Devolución" : "Realizar Venta"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Devolucion;
