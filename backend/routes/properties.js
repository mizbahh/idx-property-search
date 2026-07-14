const express = require("express");
const router = express.Router();
const pool = require("../db/pool");

// GET /api/properties/:id/openhouses 
router.get("/:id/openhouses", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id.length > 50) {
      return res.status(400).json({ error: "Invalid listing ID" });
    }

    const [property] = await pool.query(
      `SELECT L_ListingID FROM rets_property WHERE L_ListingID = ?`,
      [id]
    );

    if (property.length === 0) {
      return res.status(404).json({ error: "Property not found" });
    }

    const [openhouses] = await pool.query(
      `SELECT * FROM rets_openhouse 
       WHERE L_ListingID = ? 
       ORDER BY OpenHouseDate ASC, OH_StartTime ASC`,
      [id]
    );

    res.json(openhouses);
  } catch (err) {
    console.error("Open houses error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/properties/:id — MUST be after /:id/openhouses
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id.length > 50) {
      return res.status(400).json({ error: "Invalid listing ID" });
    }

    const [rows] = await pool.query(
      `SELECT * FROM rets_property WHERE L_ListingID = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Property not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Property detail error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/properties — MUST be last
router.get("/", async (req, res) => {
  try {
    const {
      city,
      zipcode,
      minPrice,
      maxPrice,
      beds,
      baths,
      limit = 20,
      offset = 0,
    } = req.query;

    if (isNaN(limit) || Number(limit) <= 0 || Number(limit) > 100) {
      return res.status(400).json({ error: "limit must be a number between 1 and 100" });
    }
    if (isNaN(offset) || Number(offset) < 0) {
      return res.status(400).json({ error: "offset must be a non-negative number" });
    }
    if (minPrice !== undefined && isNaN(minPrice)) {
      return res.status(400).json({ error: "minPrice must be a number" });
    }
    if (maxPrice && isNaN(maxPrice)) {
      return res.status(400).json({ error: "maxPrice must be a number" });
    }
    if (beds && isNaN(beds)) {
      return res.status(400).json({ error: "beds must be a number" });
    }
    if (baths && isNaN(baths)) {
      return res.status(400).json({ error: "baths must be a number" });
    }

    const conditions = [];
    const values = [];

    if (city) {
      conditions.push("LOWER(TRIM(L_City)) = LOWER(TRIM(?))");
      values.push(city);
    }
    if (zipcode) {
      conditions.push("L_Zip = ?");
      values.push(zipcode);
    }
    if (minPrice) {
      conditions.push("L_SystemPrice >= ?");
      values.push(Number(minPrice));
    }
    if (maxPrice) {
      conditions.push("L_SystemPrice <= ?");
      values.push(Number(maxPrice));
    }
    if (beds) {
      conditions.push("L_Keyword2 = ?");
      values.push(Number(beds));
    }
    if (baths) {
      conditions.push("LM_Dec_3 >= ?");
      values.push(Number(baths));
    }

    const whereClause = conditions.length > 0
      ? "WHERE " + conditions.join(" AND ")
      : "";

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM rets_property ${whereClause}`,
      values
    );
    const total = countResult[0].total;

    const [results] = await pool.query(
      `SELECT L_ListingID, L_Address, L_City, L_State, L_Zip,
              L_SystemPrice, L_Keyword2, LM_Dec_3, LM_Int2_3,
              L_Photos, LMD_MP_Latitude, LMD_MP_Longitude
       FROM rets_property
       ${whereClause}
       LIMIT ? OFFSET ?`,
      [...values, Number(limit), Number(offset)]
    );

    res.json({
      total,
      limit: Number(limit),
      offset: Number(offset),
      results,
    });

  } catch (err) {
    console.error("Properties query failed:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;