import "../../styles/Navbar.css";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faXmark, faArrowRightToBracket } from "@fortawesome/free-solid-svg-icons";

import { getAuth, signOut } from "firebase/auth";

const NavbarAdmin = () => {
    const navigate = useNavigate();
    const [sidebarVisible, setSidebarVisible] = React.useState(false);

    const handleLogout = async () => {
        const auth = getAuth();
        try {
            await signOut(auth);
            localStorage.removeItem("token");
            navigate("/");
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    const toggleSidebar = () => {
        setSidebarVisible(!sidebarVisible);
    };

    const hideSidebar = () => {
        setSidebarVisible(false);
    };

    React.useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 800) {
                hideSidebar();
            }
        };

        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <nav className="navbar">
            <ul className={`sidebar ${sidebarVisible ? "visible" : ""}`}>
                <li onClick={hideSidebar}>
                    <Link className="menu" to="#">
                        <FontAwesomeIcon icon={faXmark} />
                    </Link>
                </li>
                <li>
                    <Link className="link" to="/ventas">
                        Venta
                    </Link>
                </li>
                <li>
                    <Link className="link" to="/agregarProducto">
                        Agregar Producto
                    </Link>
                </li>
                <li>
                    <Link className="link" to="/agregarUsuario">
                        Agregar Usuario
                    </Link>
                </li>
                <li>
                    <Link className="link" to="/inventario">
                        Inventario
                    </Link>
                </li>
                <li>
                    <Link className="link" to="/devolucion">
                        Devolución
                    </Link>
                </li>
                <li>
                    <Link className="link" to="/historial">
                        Historial
                    </Link>
                </li>
                <li>
                    <Link className="link" onClick={handleLogout}>
                        Cerrar Sesión
                    </Link>
                </li>
            </ul>

            <ul>
                <li className="Mobile">
                    <Link className="link" to="/ventas">
                        Venta
                    </Link>
                </li>
                <li className="Mobile">
                    <Link className="link" to="/agregarProducto">
                        Agregar Producto
                    </Link>
                </li>
                <li className="Mobile">
                    <Link className="link" to="/agregarUsuario">
                        Agregar Usuario
                    </Link>
                </li>
                <li className="Mobile">
                    <Link className="link" to="/inventario">
                        Inventario
                    </Link>
                </li>
                <li className="Mobile">
                    <Link className="link" to="/devolucion">
                        Devolución
                    </Link>
                </li>
                <li className="Mobile">
                    <Link className="link" to="/historial">
                        Historial
                    </Link>
                </li>
                <li className="Mobile">
                    <Link className="link" onClick={handleLogout}>
                        Cerrar Sesión
                    </Link>
                </li>
                <li onClick={toggleSidebar}>
                    <Link className="menu" to="#">
                        <FontAwesomeIcon icon={faBars} />
                    </Link>
                </li>
            </ul>
        </nav>
    );
};

export default NavbarAdmin;
