Pruebas con Thunder Client
Registrar una nueva transferencia:

Método: POST
URL: http://localhost:3000/api/transferencias
Body:
json
Copiar código
{
  "descripcion": "Pago de alquiler",
  "fecha": "2024-06-05",
  "monto": 500,
  "cuenta_origen": 1,
  "cuenta_destino": 2
}
Obtener las últimas 10 transferencias de una cuenta:

Método: GET
URL: http://localhost:3000/api/transferencias/1


Consultar el saldo de una cuenta:

Método: GET
URL: http://localhost:3000/api/cuentas/1

Error en la transferencia: Error: Saldo insuficiente en la cuenta de origen
    at registrarTransferencia (C:\Users\diego\OneDrive\Documentos\CURSO DE DESARROLLADOR 2023\Desarrollo de Aplicaciones Full Stack JavaScript Trainee\Modulo 6\Transacciones y API REST\Dia 9\desafio\server.js:45:13)
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async C:\Users\diego\OneDrive\Documentos\CURSO DE DESARROLLADOR 2023\Desarrollo de Aplicaciones Full Stack JavaScript Trainee\Modulo 6\Transacciones y API REST\Dia 9\desafio\server.js:110:20