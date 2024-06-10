const express = require("express");
const pool = require("./db");
require("dotenv").config();

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;

// Función asíncrona para registrar una nueva transferencia
const registrarTransferencia = async (
  descripcion,
  fecha,
  monto,
  cuenta_origen,
  cuenta_destino
) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const saldoOrigenRes = await client.query(
      "SELECT saldo FROM cuentas WHERE id = $1",
      [cuenta_origen]
    );
    const saldoDestinoRes = await client.query(
      "SELECT saldo FROM cuentas WHERE id = $1",
      [cuenta_destino]
    );

    if (saldoOrigenRes.rows.length === 0) {
      throw new Error(`Cuenta de origen con ID ${cuenta_origen} no encontrada`);
    }

    if (saldoDestinoRes.rows.length === 0) {
      throw new Error(
        `Cuenta de destino con ID ${cuenta_destino} no encontrada`
      );
    }

    const saldoOrigen = saldoOrigenRes.rows[0].saldo;
    const saldoDestino = saldoDestinoRes.rows[0].saldo;

    if (saldoOrigen < monto) {
      throw new Error("Saldo insuficiente en la cuenta de origen");
    }

    await client.query("UPDATE cuentas SET saldo = saldo - $1 WHERE id = $2", [
      monto,
      cuenta_origen,
    ]);
    await client.query("UPDATE cuentas SET saldo = saldo + $1 WHERE id = $2", [
      monto,
      cuenta_destino,
    ]);

    const result = await client.query(
      "INSERT INTO transferencias (descripcion, fecha, monto, cuenta_origen, cuenta_destino) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [descripcion, fecha, monto, cuenta_origen, cuenta_destino]
    );

    await client.query("COMMIT");
    console.log("Transferencia registrada:", result.rows[0]);
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error en la transferencia:", error);
    throw error;
  } finally {
    client.release();
  }
};

// Función asíncrona para obtener las últimas 10 transferencias de una cuenta
const obtenerUltimasTransferencias = async (cuenta_id) => {
  try {
    const result = await pool.query(
      "SELECT * FROM transferencias WHERE cuenta_origen = $1 OR cuenta_destino = $1 ORDER BY fecha DESC LIMIT 10",
      [cuenta_id]
    );
    console.log("Últimas 10 transferencias:", result.rows);
    return result.rows;
  } catch (error) {
    console.error("Error obteniendo transferencias:", error);
    throw error;
  }
};

// Función asíncrona para consultar el saldo de una cuenta
const consultarSaldo = async (cuenta_id) => {
  try {
    const result = await pool.query("SELECT saldo FROM cuentas WHERE id = $1", [
      cuenta_id,
    ]);
    if (result.rows.length === 0) {
      throw new Error(`Cuenta con ID ${cuenta_id} no encontrada`);
    }
    console.log("Saldo de la cuenta:", result.rows[0]);
    return result.rows[0];
  } catch (error) {
    console.error("Error consultando saldo:", error);
    throw error;
  }
};

// Endpoint para registrar una transferencia
app.post("/api/transferencias", async (req, res) => {
  const { descripcion, fecha, monto, cuenta_origen, cuenta_destino } = req.body;
  try {
    const result = await registrarTransferencia(
      descripcion,
      fecha,
      monto,
      cuenta_origen,
      cuenta_destino
    );
    res.json(result);
  } catch (error) {
    res
      .status(500)
      .send(`Error registrando la transferencia: ${error.message}`);
  }
});

// Endpoint para obtener las últimas 10 transferencias de una cuenta
app.get("/api/transferencias/:cuenta_id", async (req, res) => {
  const cuenta_id = req.params.cuenta_id;
  try {
    const result = await obtenerUltimasTransferencias(cuenta_id);
    res.json(result);
  } catch (error) {
    res.status(500).send(`Error obteniendo transferencias: ${error.message}`);
  }
});

// Endpoint para consultar el saldo de una cuenta
app.get("/api/cuentas/:cuenta_id", async (req, res) => {
  const cuenta_id = req.params.cuenta_id;
  try {
    const result = await consultarSaldo(cuenta_id);
    res.json(result);
  } catch (error) {
    res.status(500).send(`Error consultando saldo: ${error.message}`);
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
