const express = require("express");
const cors = require("cors");
const app = express();

const invoiceRoutes = require("./routes/invoiceRoute");

const PORT = 8000;

app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
  res.send("Server is running");
});


app.use("/api", invoiceRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});