const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "InvoiceDB",
  password: "Ahmadhaiwala4444",
  port: 5432,
});

module.exports = pool;