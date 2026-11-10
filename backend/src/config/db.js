const { Pool } = require('pg');

const pool = new Pool({
    host: "localhost",
    user: "balde",
    password: "balde123",
    port: 5432,
    database: "baldedb"
});

module.exports = pool