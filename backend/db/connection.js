// backend/db/connection.js
const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
host: process.env.DB_HOST,
user: process.env.DB_USER,
password: process.env.DB_PASSWORD,
database: process.env.DB_NAME,
});

connection.connect(error => {
if (error) {
console.error('❌ Error de conexión a MySQL:', error);
process.exit(1);
}
console.log('✅ Conectado a la base de datos MySQL');
});

module.exports = connection;
