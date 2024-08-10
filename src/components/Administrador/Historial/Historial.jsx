import React, { useState, useEffect } from "react";
import "../../../styles/historial.css";
import NavbarAdmin from "../NavbarAdmin";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import format from "date-fns/format";

const formatFechaVenta = (date) => {
  return format(date, "dd/MM/yyyy");
};


const Historial = () => {
  const [historial, setHistorial] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [ventaEdit, setVentaEdit] = useState(null);
  const [ventaDetail, setVentaDetail] = useState(null);
  const [selectedTipoPago, setSelectedTipoPago] = useState("todos");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [ventaToDelete, setVentaToDelete] = useState(null); // Añadido
  const [openDeleteModal, setOpenDeleteModal] = useState(false); // Añadido

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ventasCollection = collection(db, "sales");
        const usersCollection = collection(db, "users");

        const [ventasSnapshot, usersSnapshot] = await Promise.all([
          getDocs(ventasCollection),
          getDocs(usersCollection),
        ]);

        const usersData = {};
        usersSnapshot.forEach((doc) => {
          usersData[doc.id] = doc.data().nombreUsuario;
        });

        console.log("Users data:", usersData);

        const ventas = ventasSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            idVenta: doc.id,
            ...data,
            nombreUsuario: usersData[data.idUsuario] || "N/A",
            fechaVenta: data.fechaVenta.toDate(), // Convierte el timestamp a objeto Date
          };
        });
        ventas.sort((a, b) => b.fechaVenta - a.fechaVenta);


        setHistorial(ventas);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Ocurrió un error al cargar el historial de ventas");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleOpenEditModal = (venta) => {
    setVentaEdit(venta);
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setVentaEdit(null);
  };

  const handleOpenDetailModal = (venta) => {
    setVentaDetail(venta);
    setOpenDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setOpenDetailModal(false);
    setVentaDetail(null);
  };
  
  const handleOpenDeleteModal = (venta) => { // Definido aquí
    setVentaToDelete(venta);
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setVentaToDelete(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setVentaEdit((prevVenta) => ({
      ...prevVenta,
      [name]: value,
    }));
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleSaveEdit = async () => {
    try {
      const ventaRef = doc(db, "sales", ventaEdit.idVenta);
      await updateDoc(ventaRef, {
        idUsuario: ventaEdit.idUsuario,
        tipoPago: ventaEdit.tipoPago,
        totalVenta: parseFloat(ventaEdit.totalVenta),
      });
      setHistorial((prevHistorial) =>
        prevHistorial.map((venta) =>
          venta.idVenta === ventaEdit.idVenta ? ventaEdit : venta
        )
      );
      handleCloseEditModal();
    } catch (error) {
      console.error("Error updating sale:", error);
    }
  };


  const handleDelete = async () => {
    try {
      const ventaRef = doc(db, "sales", ventaToDelete.idVenta);
      await deleteDoc(ventaRef);
      setHistorial((prevHistorial) =>
        prevHistorial.filter((venta) => venta.idVenta !== ventaToDelete.idVenta)
      );
      handleCloseDeleteModal();
    } catch (error) {
      console.error("Error deleting sale:", error);
    }
  };



  const filtrarPorTipoPago = (ventas, tipoPago) => {
    if (tipoPago === "todos") return ventas;
    return ventas.filter((venta) => venta.tipoPago === tipoPago);
  };

  const filtrarPorFecha = (ventas, fecha) => {
    if (!fecha) return ventas;
    return ventas.filter((venta) => 
      format(venta.fechaVenta, "dd/MM/yyyy") === format(fecha, "dd/MM/yyyy")
    );
  };
  

  const ventasFiltradas = filtrarPorTipoPago(
    filtrarPorFecha(historial, selectedDate),
    selectedTipoPago
  );

  const translateTipoPago = (tipoPago) => {
    switch (tipoPago) {
      case "efectivo":
        return "Efectivo";
      case "tarjeta":
        return "Tarjeta";
      case "devolucion":
        return "Devolución";
      default:
        return tipoPago;
    }
  };

  const formatoDinero = (amount) => {
    if (isNaN(amount)) {
      return "0"; // O puedes devolver un valor por defecto adecuado
    }
    return `${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
  };

  return (
    <>
      <div className="nav">
        <NavbarAdmin />
      </div>

      <div className="body-tabla">
        <main className="table">
          <section className="table-header">
            <p className="form-title">
              Total del día: $
              {formatoDinero(
                ventasFiltradas.reduce(
                  (total, venta) => total + (parseFloat(venta.totalVenta) || 0),
                  0
                )
              )}
            </p>
            <p className="form-title">
              Total de Ganancia: $
              {formatoDinero(
                ventasFiltradas.reduce(
                  (total, venta) => total + (parseFloat(venta.totalGanancia) || 0),
                  0
                )
              )}
            </p>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                className="fecha"
                label="Selecciona una fecha"
                value={selectedDate}
                onChange={(newDate) => handleDateChange(newDate)}
                renderInput={(params) => (
                  <TextField {...params} style={{ marginBottom: "16px" }} />
                )}
              />
            </LocalizationProvider>
            <FormControl className="seleccionar-pago">
              <InputLabel id="tipoPago-label">Tipo de Pago</InputLabel>
              <Select
                labelId="tipoPago-label"
                id="tipoPago"
                value={selectedTipoPago}
                onChange={(e) => setSelectedTipoPago(e.target.value)}
              >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="efectivo">Efectivo</MenuItem>
                <MenuItem value="tarjeta">Tarjeta</MenuItem>
                <MenuItem value="devolucion">Devolución</MenuItem>
              </Select>
            </FormControl>
            <Button
              className="btn-editar"
              onClick={() => console.log("Exportar a Excel")}
            >
              Exportar a Excel
            </Button>
          </section>

          {loading ? (
            <p>Cargando...</p>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : ventasFiltradas.length === 0 ? (
            <p>No hay ventas registradas</p>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID Venta</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Nombre Usuario</TableCell>
                    <TableCell>Tipo Pago</TableCell>
                    <TableCell>Total Venta</TableCell>
                    <TableCell>Total Ganancia</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ventasFiltradas.map((venta) => (
                    <TableRow key={venta.idVenta}>
                      <TableCell>{venta.idVenta}</TableCell>
                      <TableCell>
                        {formatFechaVenta(venta.fechaVenta)}
                      </TableCell>
                      <TableCell>{venta.nombreUsuario}</TableCell>
                      <TableCell>{translateTipoPago(venta.tipoPago)}</TableCell>
                      <TableCell>
                        ${formatoDinero(parseFloat(venta.totalVenta) || 0)}
                      </TableCell>
                      <TableCell>
                        ${formatoDinero(parseFloat(venta.totalGanancia) || 0)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          onClick={() => handleOpenDetailModal(venta)}
                        >
                          Detalle
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => handleOpenEditModal(venta)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => handleOpenDeleteModal(venta)}
                        >
                          Eliminar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </main>
      </div>

      {openEditModal && (
        <Dialog open={openEditModal} onClose={handleCloseEditModal}>
          <DialogTitle>Editar Venta</DialogTitle>
          <DialogContent>
            {ventaEdit && (
              <div>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="tipoPago-label">Tipo de Pago</InputLabel>
                  <Select
                    labelId="tipoPago-label"
                    id="tipoPago"
                    name="tipoPago"
                    value={ventaEdit.tipoPago}
                    onChange={handleEditChange}
                  >
                    <MenuItem value="efectivo">Efectivo</MenuItem>
                    <MenuItem value="tarjeta">Tarjeta</MenuItem>
                    <MenuItem value="devolucion">Devolución</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Total Venta"
                  name="totalVenta"
                  value={ventaEdit.totalVenta}
                  onChange={handleEditChange}
                  fullWidth
                  margin="normal"
                />
              </div>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditModal}>Cancelar</Button>
            <Button onClick={handleSaveEdit} color="primary">
              Guardar
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {openDetailModal && (
        <Dialog open={openDetailModal} onClose={handleCloseDetailModal}>
          <DialogTitle>Detalle de Venta</DialogTitle>
          <DialogContent>
            {ventaDetail && (
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
                  {ventaDetail.productos.map((producto) => (
                    <TableRow key={producto.idProducto}>
                      <TableCell>{producto.idProducto}</TableCell>
                      <TableCell>{producto.nombreProducto}</TableCell>
                      <TableCell>{producto.cantidad}</TableCell>
                      <TableCell>${formatoDinero(producto.precio)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDetailModal}>Cerrar</Button>
          </DialogActions>
        </Dialog>
      )}

        {openDeleteModal && (
          <Dialog open={openDeleteModal} onClose={handleCloseDeleteModal}>
            <DialogTitle>Eliminar Venta</DialogTitle>
            <DialogContent>
              {ventaToDelete && (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID Venta:</TableCell>
                      <TableCell>Fecha:</TableCell>
                      <TableCell>Tipo de Pago:</TableCell>
                      <TableCell>Total Venta:</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>{ventaToDelete.idVenta}</TableCell>
                      <TableCell>{formatFechaVenta(ventaToDelete.fechaVenta)}</TableCell>
                      <TableCell>{translateTipoPago(ventaToDelete.tipoPago)}</TableCell>
                      <TableCell>${formatoDinero(parseFloat(ventaToDelete.totalVenta) || 0)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDeleteModal}>Cancelar</Button>
              <Button onClick={handleDelete} color="error">Eliminar</Button>          
            </DialogActions>
          </Dialog>
        )}


    </>
  );
};

export default Historial;
