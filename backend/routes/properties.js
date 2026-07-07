const express = require("express");
const router = express.Router();
const pool = require("../db/pool");

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

        // validate limit and offset
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

        // get total count
        const [countResult] = await pool.query(
            `SELECT COUNT(*) as total FROM rets_property ${whereClause}`,
            values
        );
        const total = countResult[0].total;

        // get paginated results
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