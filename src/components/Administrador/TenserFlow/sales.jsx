import React, { useEffect, useState } from "react";
import { db } from "../../../firebase";
import { collection, onSnapshot, query } from "firebase/firestore";

const TensorFlowAnalisisVentas = () => {
  const [ventas, setVentas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [productosPopulares, setProductosPopulares] = useState([]);
  const [productosMenosPopulares, setProductosMenosPopulares] = useState([]);
  const [productosConGanancias, setProductosConGanancias] = useState([]);
  const [recomendaciones, setRecomendaciones] = useState([]);

  useEffect(() => {
    // Cargar datos de ventas desde Firebase
    const cargarVentas = async () => {
      const q = query(collection(db, "sales"));
      onSnapshot(q, (querySnapshot) => {
        const ventasArray = [];
        querySnapshot.forEach((doc) => {
          ventasArray.push(doc.data());
        });
        setVentas(ventasArray);
      });
    };

    // Cargar datos de productos desde Firebase
    const cargarProductos = async () => {
      const q = query(collection(db, "productos"));
      onSnapshot(q, (querySnapshot) => {
        const productosArray = [];
        querySnapshot.forEach((doc) => {
          productosArray.push(doc.data());
        });
        setProductos(productosArray);
      });
    };

    cargarVentas();
    cargarProductos();
  }, []);

  useEffect(() => {
    // Analizar los productos una vez que los datos están cargados
    if (ventas.length > 0 && productos.length > 0) {
      analizarProductos();
    }
  }, [ventas, productos]);

  const analizarProductos = () => {
    // Mapas para almacenar la última venta, cantidad total vendida y frecuencia de reposición
    const ultimoRegistroVentas = {};
    const totalVendido = {};
    const ventasPorSemana = {};
    const frecuenciaReposicion = {};
    const gananciasPorProducto = {};

    ventas.forEach((venta) => {
      venta.productos.forEach((producto) => {
        const fechaVenta = new Date(venta.fechaVenta.seconds * 1000);

        // Actualizar el último registro de venta
        if (
          !ultimoRegistroVentas[producto.idProducto] ||
          fechaVenta > ultimoRegistroVentas[producto.idProducto]
        ) {
          ultimoRegistroVentas[producto.idProducto] = fechaVenta;
        }

        // Sumar la cantidad vendida al total
        if (totalVendido[producto.idProducto]) {
          totalVendido[producto.idProducto] += producto.cantidad;
        } else {
          totalVendido[producto.idProducto] = producto.cantidad;
        }

        // Calcular la venta por semana
        const semanaVenta = Math.floor(
          (fechaVenta - new Date(fechaVenta.getFullYear(), 0, 1)) / 
          (1000 * 60 * 60 * 24 * 7)
        );
        if (!ventasPorSemana[producto.idProducto]) {
          ventasPorSemana[producto.idProducto] = {};
        }
        if (ventasPorSemana[producto.idProducto][semanaVenta]) {
          ventasPorSemana[producto.idProducto][semanaVenta] += producto.cantidad;
        } else {
          ventasPorSemana[producto.idProducto][semanaVenta] = producto.cantidad;
        }

        // Calcular ganancias
        const productoInfo = productos.find(p => p.idProducto === producto.idProducto);
        if (productoInfo) {
          const ganancia = (productoInfo.precioProducto - productoInfo.precioOriginal) * producto.cantidad;
          if (gananciasPorProducto[producto.idProducto]) {
            gananciasPorProducto[producto.idProducto] += ganancia;
          } else {
            gananciasPorProducto[producto.idProducto] = ganancia;
          }
        }
      });
    });

    // Calcular frecuencia de reposición
    productos.forEach((producto) => {
      const reposiciones = Object.keys(ventasPorSemana[producto.idProducto] || {}).length;
      frecuenciaReposicion[producto.idProducto] = reposiciones;
    });

    // Crear un array con la información consolidada de cada producto
    const productosConInfo = productos.map((producto) => {
      const ultimaVenta = ultimoRegistroVentas[producto.idProducto] || new Date(0); // Fecha mínima si no hay ventas
      const diferenciaDias = Math.floor(
        (new Date() - ultimaVenta) / (1000 * 60 * 60 * 24)
      );
      const totalSemanal = Object.values(ventasPorSemana[producto.idProducto] || {}).reduce(
        (sum, cant) => sum + cant, 0
      );
      return {
        ...producto,
        totalVendido: totalVendido[producto.idProducto] || 0,
        diasDesdeUltimaVenta: diferenciaDias,
        ventasSemanalPromedio: totalSemanal,
        frecuenciaReposicion: frecuenciaReposicion[producto.idProducto] || 0,
        ganancia: gananciasPorProducto[producto.idProducto] || 0,
      };
    });

    // Ordenar los productos por ganancia y cantidad vendida
    const productosConGananciasOrdenados = productosConInfo.sort(
      (a, b) => b.ganancia - a.ganancia || b.totalVendido - a.totalVendido
    );

    // Obtener los productos con mayor ganancia
    const productosGanancias = productosConGananciasOrdenados.slice(0, 20);
    setProductosConGanancias(productosGanancias);

    // Recomendar productos basados en la ganancia y la venta semanal
    const productosRecomendados = productosConGananciasOrdenados.filter((producto) => {
      return producto.ganancia > 0 && producto.ventasSemanalPromedio > 0;
    });

    // Ordenar productos recomendados por ganancia y ventas semanales
    const recomendacionesOrdenadas = productosRecomendados.sort(
      (a, b) => b.ganancia - a.ganancia || b.ventasSemanalPromedio - a.ventasSemanalPromedio
    );

    // Obtener recomendaciones basadas en ganancia y ventas semanales
    const topRecomendaciones = recomendacionesOrdenadas.slice(0, 20);
    setRecomendaciones(topRecomendaciones);

    // Ordenar los productos por menor cantidad vendida
    const productosMenosPopularesOrdenados = productosConInfo.sort(
      (a, b) => a.totalVendido - b.totalVendido || b.diasDesdeUltimaVenta - a.diasDesdeUltimaVenta
    );

    // Obtener los 20 productos menos populares
    const bottom20MenosPopulares = productosMenosPopularesOrdenados.slice(0, 20);
    setProductosMenosPopulares(bottom20MenosPopulares);
  };

  const formatoCLP = (numero) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(numero);
  };

  return (
    <div>
      <h2>Análisis de Productos</h2>

      <section className="table-body">
        <h3>Top 20 Productos Populares</h3>
        <table className="tabla-inventario">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Marca</th>
              <th>Cantidad Total Vendida</th>
              <th>Promedio Semanal Vendido</th>
              <th>Días Desde Última Venta</th>
              <th>Frecuencia de Reposición (Semanas)</th>
            </tr>
          </thead>
          <tbody>
            {productosPopulares.map((producto) => (
              <tr key={producto.idProducto}>
                <td>{producto.idProducto}</td>
                <td>{producto.nombreProducto}</td>
                <td>{producto.marcaProducto}</td>
                <td>{producto.totalVendido}</td>
                <td>{producto.ventasSemanalPromedio}</td>
                <td>{producto.diasDesdeUltimaVenta}</td>
                <td>{producto.frecuenciaReposicion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="table-body">
        <h3>Top 20 Productos Menos Populares</h3>
        <table className="tabla-inventario">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Marca</th>
              <th>Cantidad Total Vendida</th>
              <th>Promedio Semanal Vendido</th>
              <th>Días Desde Última Venta</th>
              <th>Frecuencia de Reposición (Semanas)</th>
            </tr>
          </thead>
          <tbody>
            {productosMenosPopulares.map((producto) => (
              <tr key={producto.idProducto}>
                <td>{producto.idProducto}</td>
                <td>{producto.nombreProducto}</td>
                <td>{producto.marcaProducto}</td>
                <td>{producto.totalVendido}</td>
                <td>{producto.ventasSemanalPromedio}</td>
                <td>{producto.diasDesdeUltimaVenta}</td>
                <td>{producto.frecuenciaReposicion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="table-body">
        <h3>Productos con Mayor Ganancia</h3>
        <table className="tabla-inventario">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Marca</th>
              <th>Ganancia</th>
            </tr>
          </thead>
          <tbody>
            {productosConGanancias.map((producto) => (
              <tr key={producto.idProducto}>
                <td>{producto.idProducto}</td>
                <td>{producto.nombreProducto}</td>
                <td>{producto.marcaProducto}</td>
                <td>{formatoCLP(producto.ganancia)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="table-body">
        <h3>Recomendaciones de Productos</h3>
        <table className="tabla-inventario">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Marca</th>
              <th>Ganancia</th>
              <th>Promedio Semanal Vendido</th>
            </tr>
          </thead>
          <tbody>
            {recomendaciones.map((producto) => (
              <tr key={producto.idProducto}>
                <td>{producto.idProducto}</td>
                <td>{producto.nombreProducto}</td>
                <td>{producto.marcaProducto}</td>
                <td>{formatoCLP(producto.ganancia)}</td>
                <td>{producto.ventasSemanalPromedio}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default TensorFlowAnalisisVentas;
