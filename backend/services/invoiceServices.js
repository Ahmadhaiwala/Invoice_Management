const pool = require("../db.js");

const getInvoice = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM invoice");
    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

const getInvoiceDetail = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await pool.query(
      "SELECT * FROM invoice WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.json(result.rows[0]);
  } catch (e) {
    res.status(500).json({ error: "Failed fetching invoice detail" });
  }
};

const getInvoiceLines = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM invoiceline WHERE invoiceid = $1 ORDER BY id",
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed fetching line items" });
  }
};

const getPayments = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM payment WHERE invoiceid = $1 ORDER BY paymentdate DESC",
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed fetching payments" });
  }
};

const addPayment = async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const invoice = await client.query(
      "SELECT * FROM invoice WHERE id = $1",
      [id]
    );

    if (invoice.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Invoice not found" });
    }

    const balanceDue = parseFloat(invoice.rows[0].balancedue);
    const parsedAmount = parseFloat(amount);

    if (parsedAmount <= 0 || parsedAmount > balanceDue) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: `Invalid payment amount. Balance due is ₹${balanceDue.toFixed(2)}`
      });
    }

    // Insert payment record
    await client.query(
      "INSERT INTO payment (invoiceid, amount) VALUES ($1, $2)",
      [id, parsedAmount]
    );

    // Update amountPaid and status only (balanceDue is a generated column)
    const newAmountPaid = parseFloat(invoice.rows[0].amountpaid) + parsedAmount;
    const newStatus = newAmountPaid >= parseFloat(invoice.rows[0].total) ? "PAID" : invoice.rows[0].status;

    const updatedInvoice = await client.query(
      `UPDATE invoice
       SET amountpaid = $1,
           status = $2::invoice_status,
           updatedAt = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [newAmountPaid, newStatus, id]
    );

    await client.query("COMMIT");

    res.json(updatedInvoice.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Server error" });
  } finally {
    client.release();
  }
};

const archiveInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "UPDATE invoice SET isArchived = true WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.json({
      message: "Invoice archived successfully",
      invoice: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const restoreInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "UPDATE invoice SET isArchived = false WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.json({
      message: "Invoice restored successfully",
      invoice: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  getInvoice,
  getInvoiceDetail,
  getInvoiceLines,
  getPayments,
  addPayment,
  archiveInvoice,
  restoreInvoice
};