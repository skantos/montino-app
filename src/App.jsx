import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { UserAuth } from "./context/AuthContext";

import Login from "./components/Login";

import RegistrarUsuario from "./components/Administrador/Agregarusuario/RegistrarUsuario";
import AgregarProducto from "./components/Administrador/AgregarProducto/AgregarProducto";
import Ventas from "./components/Administrador/Ventas/Ventas";
import Inventario from "./components/Administrador/Inventario/Inventario";
import Devolucion from "./components/Administrador/Devolucion/Devolucion";
import Historial from "./components/Administrador/Historial/Historial";
import Dashboard from "./components/Administrador/Dashboard/Dashboard";

import VentaVendedor from "./components/Vendedor/VentaVendedor/VentaVendedor";

function ProtectedRoute({ children, allowedRoles }) {
  const { user, role } = UserAuth();
  if (!user) {
    return <Navigate to="/login" />;
  }
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" />;
  }
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/agregarUsuario"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <RegistrarUsuario />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agregarProducto"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AgregarProducto />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ventas"
        element={
          <ProtectedRoute allowedRoles={["admin", "vendedor"]}>
            <Ventas />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventario"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Inventario />
          </ProtectedRoute>
        }
      />
      <Route
        path="/devolucion"
        element={
          <ProtectedRoute allowedRoles={["admin", "vendedor"]}>
            <Devolucion />
          </ProtectedRoute>
        }
      />
      <Route
        path="/historial"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Historial />
          </ProtectedRoute>
        }
      />

      <Route
        path="/vendedor/ventas"
        element={
          <ProtectedRoute allowedRoles={["vendedor"]}>
            <VentaVendedor />
          </ProtectedRoute>
        }
      />

      <Route
        path="/unauthorized"
        element={
          <div>
            Unauthorized - You do not have permission to view this page.
          </div>
        }
      />
    </Routes>
  );
}

export default App;
