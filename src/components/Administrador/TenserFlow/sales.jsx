import React, { useEffect, useState } from "react";
import { db } from "../../../firebase";
import { collection, onSnapshot, query } from "firebase/firestore";
import * as tf from "@tensorflow/tfjs";

export default function SalesAI() {
  const [prediccionesPago, setPrediccionesPago] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, "sales")),
      (querySnapshot) => {
        const ventaData = querySnapshot.docs.map((doc) => ({
          fechaVenta: new Date(doc.data().fechaVenta),
          tipoPago: doc.data().tipoPago,
          totalVenta: parseInt(doc.data().totalVenta, 10),
        }));
        procesarDatos(ventaData);
      }
    );

    return () => unsubscribe();
  }, []);

  const procesarDatos = (ventaData) => {
    const ventaPorMes = agruparPorMes(ventaData);
    entrenarModelo(ventaPorMes);
  };

  const agruparPorMes = (ventaData) => {
    const ventaPorMes = {};

    ventaData.forEach((venta) => {
      const mes = `${venta.fechaVenta.getMonth() + 1}/${venta.fechaVenta
        .getFullYear()
        .toString()
        .slice(-2)}`;
      if (!ventaPorMes[mes]) {
        ventaPorMes[mes] = { tarjeta: 0, efectivo: 0 };
      }
      if (venta.tipoPago === "tarjeta") {
        ventaPorMes[mes].tarjeta += 1;
      } else if (venta.tipoPago === "efectivo") {
        ventaPorMes[mes].efectivo += 1;
      }
    });

    return Object.keys(ventaPorMes).map((mes) => ({
      mes,
      tarjeta: ventaPorMes[mes].tarjeta,
      efectivo: ventaPorMes[mes].efectivo,
    }));
  };

  const entrenarModelo = async (ventasPorMes) => {
    try {
      const meses = ventasPorMes.map((venta) => [
        parseInt(venta.mes.split("/")[0], 10),
      ]);

      const targetTensor = tf.tensor2d(
        ventasPorMes.map((venta) => [venta.tarjeta, venta.efectivo]),
        [ventasPorMes.length, 2]
      );

      const model = tf.sequential();
      model.add(
        tf.layers.dense({ units: 10, inputShape: [1], activation: "relu" })
      );
      model.add(tf.layers.dense({ units: 2, activation: "softmax" }));

      model.compile({ loss: "categoricalCrossentropy", optimizer: "adam" });

      await model.fit(tf.tensor2d(meses), targetTensor, { epochs: 10 });

      const futureMeses = tf.tensor2d([
        [8],
        [9],
        [10],
        [11],
        [12],
        [1],
        [2],
        [3],
        [4],
        [5],
        [6],
        [7],
        [8],
        [9],
        [10],
        [11],
        [12],
      ]);

      const predictions = model.predict(futureMeses).arraySync();

      setPrediccionesPago(predictions);
    } catch (error) {
      console.error("Error processing data with TensorFlow:", error);
    }
  };

  const obtenerMeses = () => {
    const meses = [];
    let año = 24;
    for (let i = 8; i <= 12; i++) {
      meses.push(`${i}/${año}`);
    }
    año = 25;
    for (let i = 1; i <= 12; i++) {
      meses.push(`${i}/${año}`);
    }
    return meses;
  };

  return (
    <div>
      <main className="main1">
        <div className="carrito-label-devolucion">
          <h1 className="form-title">Predicción del Tipo de Pago por Mes</h1>
          <table className="carrito-tabla">
            <thead className="carrito-th">
              <tr className="carrito-tr">
                <th className="carrito-th">Meses</th>
                <th className="carrito-th">Predicción Tarjeta</th>
                <th className="carrito-th">Predicción Efectivo</th>
              </tr>
            </thead>
            <tbody className="carrito-items">
              {prediccionesPago.map((pred, index) => (
                <tr key={index}>
                  <td>{obtenerMeses()[index]}</td>
                  <td>{(pred[0] * 100).toFixed(2)}%</td>
                  <td>{(pred[1] * 100).toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
