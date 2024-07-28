import React, { useState, useEffect } from "react";
import NavbarAdmin from "../NavbarAdmin";
import { db } from "../../../firebase";
import { collection, getDocs } from "firebase/firestore";
import { Bar, Pie } from "react-chartjs-2";
import "chart.js/auto";
import "../../../styles/dashboard.css";

const Dashboard = () => {
  const [ventas, setVentas] = useState([]);
  const [salesByType, setSalesByType] = useState({});
  const [salesByUser, setSalesByUser] = useState({});
  const [salesByProduct, setSalesByProduct] = useState({});
  const [totalSales, setTotalSales] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const calculateMetrics = (ventasList, productsData) => {
    const salesByType = {};
    const salesByUser = {};
    const salesByProduct = {};
    let totalSales = 0;

    ventasList.forEach((sale) => {
      const { tipoPago, totalVenta, nombreUsuario, productos } = sale;

      if (salesByType[tipoPago]) {
        salesByType[tipoPago] += 1;
      } else {
        salesByType[tipoPago] = 1;
      }

      if (salesByUser[nombreUsuario]) {
        salesByUser[nombreUsuario] += Math.abs(totalVenta);
      } else {
        salesByUser[nombreUsuario] = Math.abs(totalVenta);
      }

      productos.forEach((product) => {
        const { idProducto, cantidad } = product;
        const nombreProducto = productsData[idProducto] || idProducto;
        if (salesByProduct[nombreProducto]) {
          salesByProduct[nombreProducto] += cantidad;
        } else {
          salesByProduct[nombreProducto] = cantidad;
        }
      });

      totalSales += Math.abs(totalVenta);
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

        const ventasList = ventasSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            idVenta: doc.id,
            ...data,
            nombreUsuario: usersData[data.idUsuario] || "N/A",
          };
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
  }, []);

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
        <h1>Dashboard</h1>
        <div className="metrics">
          <h2>Total Ventas: ${formatoDinero(totalSales.toFixed(2))}</h2>
        </div>
        <div className="charts">
          <div className="chart">
            <h3>Ventas por Tipo de Pago</h3>
            <Pie data={salesByTypeData} />
          </div>
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
  );
};

export default Dashboard;
