import React, { useEffect, useState, useContext } from "react";
import NavbarAdmin from "../NavbarAdmin.jsx";
import { AuthContext } from "../../../context/AuthContext.jsx";
import "../../../styles/ventas.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus, faTrash } from "@fortawesome/free-solid-svg-icons";

const Ventas = () => {
    const [productos, setProductos] = useState([]);
    const [error, setError] = useState("");
    const [inventarioFiltrado, setInventarioFiltrado] = useState([]);
    const [carrito, setCarrito] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tipoPago, setTipoPago] = useState("efectivo");
    const [cantidadEntregada, setCantidadEntregada] = useState(0);
    const [vuelto, setVuelto] = useState(0);
    const [users, setUsers] = useState([]);
    const [idProductoBuscado, setIdProductoBuscado] = useState("");
    const [cantidadBuscada, setCantidadBuscada] = useState(1);
    const { user, role } = useContext(AuthContext); // Asegúrate de que `role` esté incluido

    useEffect(() => {
        // Verificar si el usuario está autenticado y tiene el rol de admin
        if (!user) {
            // Redirigir al login si no está autenticado
            window.location.href = "/login"; // Cambia la ruta según tu configuración
        } else if (role !== "admin") {
            // Redirigir si no es admin
            window.location.href = "/unauthorized"; // Cambia la ruta según tu configuración
        }
    }, [user, role]);

    useEffect(() => {
        const getProductos = async () => {
            try {
                const response = await fetch("/products/products");
                const data = await response.json();
                if (data.success && Array.isArray(data.products)) {
                    setProductos(data.products);
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

        const getUsers = async () => {
            try {
                const response = await fetch("/users/users");
                const data = await response.json();
                if (data.success && Array.isArray(data.users)) {
                    setUsers(data.users);
                    console.log("Usuarios:", data.users);
                } else {
                    setError("Datos de usuarios no son un array.");
                }
            } catch (error) {
                setError("Error al obtener los usuarios");
                console.error("Error al obtener los usuarios:", error);
            } finally {
                setLoading(false);
            }
        };

        getUsers();
        getProductos();
    }, []);

    useEffect(() => {
        if (idProductoBuscado.length > 0) {
            const productoEncontrado = productos.find(
                (producto) => String(producto.idProducto) === idProductoBuscado
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
                (item) => item.idProducto === producto.idProducto
            );
            if (productoExistente) {
                if (
                    productoExistente.cantidad + cantidad <=
                    producto.cantidadProducto
                ) {
                    return prevCarrito.map((item) =>
                        item.idProducto === producto.idProducto
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
            const producto = prevCarrito.find(
                (item) => item.idProducto === idProducto
            );
            const stockProducto = productos.find(
                (item) => item.idProducto === idProducto
            )?.cantidadProducto;

            if (producto && stockProducto > producto.cantidad) {
                return prevCarrito.map((item) =>
                    item.idProducto === idProducto
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
                producto.idProducto === idProducto
                    ? { ...producto, cantidad: Math.max(1, producto.cantidad - 1) }
                    : producto
            )
        );
    };

    const eliminarDelCarrito = (idProducto) => {
        setCarrito((prevCarrito) =>
            prevCarrito.filter((producto) => producto.idProducto !== idProducto)
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
        const idUsers = user.uid; // Asegúrate de que `user.uid` esté correctamente definido
        const productosVenta = carrito.map((producto) => ({
            idProducto: producto.idProducto,
            cantidad: producto.cantidad,
        }));

        try {
            const response = await fetch("/sales/sales", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    fechaVenta,
                    totalVenta,
                    tipoPago,
                    idUsers,
                    productos: productosVenta,
                }),
            });
            const data = await response.json();
            if (data.success) {
                const updates = carrito.map((producto) => ({
                    idProducto: producto.idProducto,
                    nuevaCantidad: producto.cantidadProducto - producto.cantidad,
                }));
                await fetch("products/updateQuantity", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(updates),
                });
                setCarrito([]);
                alert("Venta registrada con éxito");
            } else {
                setError("Error al registrar la venta");
            }
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
                                        (producto) =>
                                            String(producto.idProducto) === idProductoBuscado
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
                            min="1" // Atributo para prevenir valores menores a 1
                            onChange={(e) => {
                                const valor = parseInt(e.target.value);
                                setCantidadBuscada(valor < 1 ? 1 : valor); // Asegurarse que el valor nunca sea menor que 1
                            }}
                        />
                    </div>

                    <div className="producto-label">
                        <hr />
                        <div className="tipoPago">
                            <p className="textp">Tipo de pago</p>
                            <select
                                className="seleccionar-pago"
                                value={tipoPago}
                                onChange={handleTipoPagoChange}
                            >
                                <option value="efectivo">Efectivo</option>
                                <option value="tarjeta">Tarjeta</option>
                            </select>
                        </div>

                        <section className="tabla-ventas">
                            <table className="carrito-tabla">
                                <thead className="carrito-th">
                                    <tr className="carrito-tr">
                                        <th className="carrito-th">Producto</th>
                                        <th className="carrito-th">Precio</th>
                                        <th className="carrito-th">Cantidad</th>
                                        <th className="carrito-th">Total</th>
                                        <th className="carrito-th">Acciones</th> {/* Nueva columna */}
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

                        <p className="textp">
                            Total:{" "}
                            {formatoDinero(
                                carrito.reduce(
                                    (total, producto) =>
                                        total + producto.precioProducto * producto.cantidad,
                                    0
                                )
                            )}
                        </p>
                        {tipoPago === "efectivo" && (
                            <div className="efectivo">
                                <label className="textp">Ingresar efectivo</label>
                                <input
                                    className="carrito-input"
                                    type="number"
                                    value={cantidadEntregada}
                                    onChange={handleCantidadEntregadaChange}
                                />
                                <p className="textp">Vuelto: ${formatoDinero(vuelto)}</p>
                            </div>
                        )}

                        <button className="boton-venta" onClick={handleSubmit}>
                            <span>Finalizar Venta</span>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Ventas;
