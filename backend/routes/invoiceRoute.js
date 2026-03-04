const express = require("express");
const router = express.Router();

const {
  getInvoice,
  getInvoiceDetail,
  getInvoiceLines,
  getPayments,
  addPayment,
  createInvoice,
  archiveInvoice,
  restoreInvoice
} = require("../services/invoiceServices");

// List all invoices
router.get("/invoices", getInvoice);

// Create a new invoice
router.post("/invoices", createInvoice);

// Invoice detail by ID
router.get("/invoice/:id", getInvoiceDetail);

// Line items for an invoice
router.get("/invoice/:id/lines", getInvoiceLines);

// Payments for an invoice
router.get("/invoice/:id/payments", getPayments);

// Add a payment
router.post("/invoice/:id/payments", addPayment);

// Archive / Restore
router.post("/invoice/:id/archive", archiveInvoice);
router.post("/invoice/:id/restore", restoreInvoice);

module.exports = router;