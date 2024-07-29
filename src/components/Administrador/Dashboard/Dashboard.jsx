import React, { useState, useEffect } from "react";
import NavbarAdmin from "../NavbarAdmin";
import { db } from "../../../firebase";
import { collection, getDocs } from "firebase/firestore";
import { Bar, Pie } from "react-chartjs-2";
import "chart.js/auto";
import "../../../styles/dashboard.css";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { TextField } from "@mui/material";

const Dashboard = () => {
  const [ventas, setVentas] = useState([]);
  const [salesByType, setSalesByType] = useState({});
  const [salesByUser, setSalesByUser] = useState({});
  const [salesByProduct, setSalesByProduct] = useState({});
  const [totalSales, setTotalSales] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const calculateMetrics = (ventasList, productsData) => {
    const salesByType = {};
    const salesByUser = {};
    const salesByProduct = {};
    let totalSales = 0;

    ventasList.forEach((sale) => {
      const { tipoPago, totalVenta, nombreUsuario, productos } = sale;

      // Calcula ventas por tipo de pago
      if (salesByType[tipoPago]) {
        salesByType[tipoPago] += 1;
      } else {
        salesByType[tipoPago] = 1;
      }

      // Calcula ventas por usuario
      if (salesByUser[nombreUsuario]) {
        salesByUser[nombreUsuario] += totalVenta; // Mantener el signo
      } else {
        salesByUser[nombreUsuario] = totalVenta; // Mantener el signo
      }

      // Calcula ventas por producto
      productos.forEach((product) => {
        const { idProducto, cantidad } = product;
        const nombreProducto = productsData[idProducto] || idProducto;
        if (salesByProduct[nombreProducto]) {
          salesByProduct[nombreProducto] += cantidad;
        } else {
          salesByProduct[nombreProducto] = cantidad;
        }
      });

      // Calcula total de ventas
      totalSales += totalVenta; // Mantener el signo
    });

    setSalesByType(salesByType);
    setSalesByUser(salesByUser);
    setSalesByProduct(salesByProduct);
    setTotalSales(totalSales);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ventasCollection = collection(db, "sales");
        const usersCollection = collection(db, "users");
        const productsCollection = collection(db, "products");

        const [ventasSnapshot, usersSnapshot, productsSnapshot] =
          await Promise.all([
            getDocs(ventasCollection),
            getDocs(usersCollection),
            getDocs(productsCollection),
          ]);

        const usersData = {};
        usersSnapshot.forEach((doc) => {
          usersData[doc.id] = doc.data().nombreUsuario;
        });

        const productsData = {};
        productsSnapshot.forEach((doc) => {
          productsData[doc.id] = doc.data().nombreProducto;
        });

        const ventasList = ventasSnapshot.docs
          .map((doc) => {
            const data = doc.data();
            let saleDate;
            if (data.fecha && data.fecha.toDate) {
              saleDate = data.fecha.toDate(); // Firestore Timestamp
            } else if (data.fecha && data.fecha.toDate === undefined) {
              saleDate = new Date(data.fecha); // Assumed to be a Date
            } else {
              saleDate = new Date(); // Default to now if no fecha
            }
            return {
              idVenta: doc.id,
              ...data,
              nombreUsuario: usersData[data.idUsuario] || "N/A",
              fecha: saleDate,
            };
          })
          .filter((sale) => {
            const saleDate = new Date(sale.fecha);
            return (
              saleDate.toDateString() === selectedDate.toDateString()
            );
          });

        setVentas(ventasList);
        setLoading(false);
        calculateMetrics(ventasList, productsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Ocurrió un error al cargar el historial de ventas");
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDate]);

  const salesByTypeData = {
    labels: Object.keys(salesByType),
    datasets: [
      {
        label: "Ventas por Tipo de Pago",
        data: Object.values(salesByType),
        backgroundColor: [
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 159, 64, 0.6)",
        ],
      },
    ],
  };

  const salesByUserData = {
    labels: Object.keys(salesByUser),
    datasets: [
      {
        label: "Ventas por Usuario",
        data: Object.values(salesByUser),
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 159, 64, 0.6)",
        ],
      },
    ],
  };

  const salesByProductData = {
    labels: Object.keys(salesByProduct),
    datasets: [
      {
        label: "Ventas por Producto",
        data: Object.values(salesByProduct),
        backgroundColor: [
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 99, 132, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 159, 64, 0.6)",
        ],
      },
    ],
  };

  const formatoDinero = (amount) => {
    return `${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <div className="nav">
        <NavbarAdmin />
      </div>
      <div className="container">
        <div className="date-filter">
          <h3>Filtrar por Fecha</h3>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              value={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              renderInput={(params) => (
                <TextField {...params} style={{ marginBottom: "16px" }} />
              )}
            />
          </LocalizationProvider>
        </div>
        <div className="metrics">
          <h2>Total Ventas: ${formatoDinero(totalSales.toFixed(0))}</h2>
        </div>
        <div className="charts-container">
          <div className="pie-chart">
            <h3>Ventas por Tipo de Pago</h3>
            <Pie data={salesByTypeData} />
          </div>
          <div className="bar-charts">
            <div className="chart">
              <h3>Ventas por Usuario</h3>
              <Bar data={salesByUserData} />
            </div>
            <div className="chart">
              <h3>Ventas por Producto</h3>
              <Bar data={salesByProductData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
