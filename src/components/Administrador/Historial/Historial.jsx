import React, { useEffect, useState } from "react";
import "../../../styles/historial.css";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../firebase";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import format from "date-fns/format";

const formatFechaVenta = (fechaVenta) => {
  const date = new Date(fechaVenta.toDate());
  return format(date, "dd/MM/yyyy");
};

const Historial = () => {
  const [historial, setHistorial] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTipoPago, setSelectedTipoPago] = useState("todos");

  useEffect(() => {
    const getHistorial = async () => {
      setLoading(true);
      setError("");
      try {
        const salesCollection = collection(db, "sales");

        // Ensure selectedDate is a Date object and reset time components
        const startDate = new Date(selectedDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1); // To include the full day

        const salesQuery = query(
          salesCollection,
          where("createdAt", ">=", startDate),
          where("createdAt", "<", endDate)
        );

        const salesSnapshot = await getDocs(salesQuery);
        if (salesSnapshot.empty) {
          setError("No hay ventas para la fecha seleccionada.");
          setHistorial([]);
          return;
        }

        const salesData = salesSnapshot.docs.map((doc) => doc.data());
        console.log("salesData", salesData);

        const groupedSales = salesData.reduce((acc, sale) => {
          const saleId = sale.idVenta;
          if (!acc[saleId]) {
            acc[saleId] = {
              idVenta: saleId,
              fechaVenta: sale.createdAt,
              idUsers: sale.Sale.User?.idUsuario || "N/A",
              tipoPago: sale.Sale.tipoPago || "N/A",
              User: { nombre: sale.Sale.User?.nombreUsuario || "N/A" },
              Products: [],
              totalVenta: 0,
            };
          }

          if (sale.Product) {
            acc[saleId].Products.push({
              idProducto: sale.Product.idProducto,
              nombre: sale.Product.nombreProducto,
              cantidad: sale.cantidad,
              precio: sale.Product.precioProducto || 0,
            });

            acc[saleId].totalVenta +=
              sale.cantidad * (sale.Product.precioProducto || 0);
          }

          return acc;
        }, {});

        setHistorial(Object.values(groupedSales));
      } catch (error) {
        setError("Error al obtener las ventas.");
        console.error("Error al obtener las ventas:", error);
      } finally {
        setLoading(false);
      }
    };

    getHistorial();
  }, [selectedDate]);

  const translateTipoPago = (tipoPago) => {
    switch (tipoPago) {
      case "efectivo":
        return "Efectivo";
      case "tarjeta":
        return "Tarjeta";
      default:
        return tipoPago;
    }
  };

  const handleOpenModal = (products) => {
    setSelectedProducts(products);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const formatoDinero = (amount) => {
    return `${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    historial.forEach((venta, index) => {
      const wsData = [];
      wsData.push([
        "Id Venta",
        "Fecha",
        "Nombre Usuario",
        "Id Producto",
        "Nombre Producto",
        "Cantidad",
        "Precio",
        "Total Venta",
      ]);
      wsData.push([
        venta.idVenta,
        formatFechaVenta(venta.fechaVenta),
        venta.User?.nombre || "N/A",
        "",
        "",
        "",
        "", // Placeholder for the main sale details row
      ]);
      venta.Products.forEach((producto) => {
        wsData.push([
          "",
          "",
          "", // Empty cells for main sale details row
          producto.idProducto,
          producto.nombre,
          producto.cantidad,
          producto.precio,
          "", // Empty cell for main sale details row
        ]);
      });
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.aoa_to_sheet(wsData),
        `Venta_${index + 1}`
      );
    });

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "historial_ventas.xlsx");
  };

  const filtrarPorFecha = (ventas, fecha) => {
    return ventas.filter((venta) => {
      const ventaFecha = new Date(venta.fechaVenta.toDate());
      return (
        ventaFecha.getFullYear() === fecha.getFullYear() &&
        ventaFecha.getMonth() === fecha.getMonth() &&
        ventaFecha.getDate() === fecha.getDate()
      );
    });
  };

  const filtrarPorTipoPago = (ventas, tipoPago) => {
    if (tipoPago === "todos") return ventas;
    return ventas.filter((venta) => venta.tipoPago === tipoPago);
  };

  const ventasFiltradas = filtrarPorTipoPago(
    filtrarPorFecha(historial, selectedDate),
    selectedTipoPago
  );

  const totalFinal = ventasFiltradas.reduce(
    (total, venta) => total + venta.totalVenta,
    0
  );

  return (
    <>
      <div className="nav">
        <NavbarAdmin />
      </div>

      <div className="body-tabla">
        <main className="table">
          <section className="table-header">
            <p className="form-title">
              Total del día: ${formatoDinero(totalFinal)}
            </p>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                className="fecha"
                label="Selecciona una fecha"
                value={selectedDate}
                onChange={(newDate) => setSelectedDate(newDate)}
                renderInput={(params) => (
                  <TextField {...params} style={{ marginBottom: "16px" }} />
                )}
              />
            </LocalizationProvider>

            <select
              className="seleccionar-pago"
              name="tipoPago"
              id="tipoPago"
              value={selectedTipoPago}
              onChange={(e) => setSelectedTipoPago(e.target.value)}
            >
              <option value="todos">Tipo de pago</option>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
            </select>

            <button className="btn-editar" onClick={exportToExcel}>
              Exportar a Excel
            </button>
          </section>

          {loading ? (
            <p>Cargando...</p>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : ventasFiltradas.length === 0 ? (
            <p>No hay ventas registradas en esta fecha</p>
          ) : (
            <>
              <section className="table-body">
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>ID Venta</TableCell>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Nombre Usuario</TableCell>
                        <TableCell>Tipo de Pago</TableCell>
                        <TableCell>Detalles</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {ventasFiltradas.map((venta) => (
                        <TableRow key={venta.idVenta}>
                          <TableCell>{venta.idVenta}</TableCell>
                          <TableCell>
                            {formatFechaVenta(venta.fechaVenta)}
                          </TableCell>
                          <TableCell>{venta.User?.nombre || "N/A"}</TableCell>
                          <TableCell>
                            {translateTipoPago(venta.tipoPago)}
                          </TableCell>
                          <TableCell>
                            <Button
                              onClick={() => handleOpenModal(venta.Products)}
                            >
                              Ver detalles
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </section>
            </>
          )}
        </main>
      </div>

      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>Detalles de Venta</DialogTitle>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID Producto</TableCell>
                  <TableCell>Nombre Producto</TableCell>
                  <TableCell>Cantidad</TableCell>
                  <TableCell>Precio</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedProducts.map((producto) => (
                  <TableRow key={producto.idProducto}>
                    <TableCell>{producto.idProducto}</TableCell>
                    <TableCell>{producto.nombre}</TableCell>
                    <TableCell>{producto.cantidad}</TableCell>
                    <TableCell>${formatoDinero(producto.precio)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Historial;
