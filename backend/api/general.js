const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const util = require('util');

const con = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

router.post("/", (req, res) => {
    let { timespan } = req.body;
    let currentDate = new Date();
    let startDate;

    switch (timespan) {
        case "day":
            startDate = new Date(currentDate);
            startDate.setDate(currentDate.getDate() - 1);
            break;
        case "week":
            startDate = new Date(currentDate);
            startDate.setDate(currentDate.getDate() - 7);
            break;
        case "month":
            startDate = new Date(currentDate);
            startDate.setMonth(currentDate.getMonth() - 1);
            break;
        case "year":
            startDate = new Date(currentDate);
            startDate.setFullYear(currentDate.getFullYear() - 1);
            break;
        case "hour":
            startDate = new Date(currentDate);
            startDate.setHours(currentDate.getHours() - 1);
            break;
        default:
            startDate = new Date(1970, 0, 1); // Default to start from the beginning
            break;
    }

    con.query("SELECT * FROM presences WHERE timestamp >= ? ORDER BY id DESC", [startDate], function (err, result, fields) {
        if (err) throw err;
        res.send(result).status(200);
    });
});


router.post("/user/:username", (req, res) => {
    let { timespan } = req.body;
    let currentDate = new Date();
    let startDate;

    switch (timespan) {
        case "day":
            startDate = new Date(currentDate);
            startDate.setDate(currentDate.getDate() - 1);
            break;
        case "week":
            startDate = new Date(currentDate);
            startDate.setDate(currentDate.getDate() - 7);
            break;
        case "month":
            startDate = new Date(currentDate);
            startDate.setMonth(currentDate.getMonth() - 1);
            break;
        case "year":
            startDate = new Date(currentDate);
            startDate.setFullYear(currentDate.getFullYear() - 1);
            break;
        case "hour":
            startDate = new Date(currentDate);
            startDate.setHours(currentDate.getHours() - 1);
            break;
        default:
            startDate = new Date(1970, 0, 1); // Default to start from the beginning
            break;
    }
    
    con.query(`SELECT * FROM presences WHERE username='${req.params.username}' AND timestamp >= ? ORDER BY id DESC`, [startDate], (err, result) => {
        if (err) throw err;
        res.send(result).status(200);
    })
})

router.get("/users", (req, res) => {
    con.query(`WITH RankedPresences AS (
        SELECT
            id,
            username,
            status,
            timestamp,
            avatar,
            ROW_NUMBER() OVER (PARTITION BY username ORDER BY timestamp DESC) AS RowNum
        FROM
            presences
    )
    SELECT
        id,
        username,
        status,
        timestamp,
        avatar
    FROM
        RankedPresences
    WHERE
        RowNum = 1;
    `, (err, result) => {
        res.send(result).status(200);
    })
})

const queryAsync = util.promisify(con.query).bind(con);
router.post("/stats", async (req, res) => {
    let obj = {};

    try {
        const countResult = await queryAsync("SELECT COUNT(*) as count FROM presences");
        obj.records = countResult[0].count;

        const sizeResult = await queryAsync(`
            SELECT table_schema AS "dbname",
            ROUND(SUM(data_length + index_length) / 1024 / 1024, 1) AS "dbsize"
            FROM information_schema.tables
            WHERE table_schema = 'discord'
            GROUP BY table_schema;
        `);
        obj.size = sizeResult[0].dbsize;

        res.status(200).send(obj);
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;