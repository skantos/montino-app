import "../../styles/Navbar.css";
import React from "react";
import { Link, useNavigate } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
faBars,
faXmark,
faArrowRightToBracket,
} from "@fortawesome/free-solid-svg-icons";
import { UserAuth } from "../../context/AuthContext";

const NavbarVendedor = () => {
const navigate = useNavigate();
const [sidebarVisible, setSidebarVisible] = React.useState(false);
const { signOut } = UserAuth();

const handleLogout = async () => {
    try {
    await signOut();
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
        <Link className="link" to="/vendedor/ventas">
            Venta
        </Link>
        </li>
        <li>
        <Link className="link" to="/vendedor/inventario">
            Inventario
        </Link>
        </li>
        <li>
        <Link className="link" to="/vendedor/devolucion">
            Devolución
        </Link>
        </li>
        <li>
        <Link className="link" onClick={handleLogout}>
            Cerrar Sesion
        </Link>
        </li>
    </ul>

    <ul>
        <li className="Mobile">
        <Link className="link" to="/vendedor/inventario">
            Inventario
        </Link>
        </li>
        <li className="Mobile">
        <Link className="link" to="/vendedor/ventas">
            Venta
        </Link>
        </li>
        <li className="Mobile">
        <Link className="link" to="/vendedor/devolucion">
            Devolución
        </Link>
        </li>
        <li className="Mobile">
        <Link className="link" onClick={handleLogout}>
            Cerrar Sesion
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

export default NavbarVendedor;
