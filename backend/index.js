require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db/pool");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch (err) {
    console.error("Health check failed:", err.message);
    res.status(500).json({ status: "error", database: "disconnected" });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

const propertiesRouter = require("./routes/properties");
app.use("/api/properties", propertiesRouter);