// src/config/database.js
const { Pool } = require('pg');
const env = require('./env');

const poolConfig = env.DATABASE_URL 
    ? { 
        connectionString: env.DATABASE_URL, 
        ssl: { rejectUnauthorized: false },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 15000
      }
    : {
        host: env.DB_HOST,
        port: env.DB_PORT,
        user: env.DB_USER,
        password: String(env.DB_PASSWORD),
        database: env.DB_NAME,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 15000,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    };

const pgPool = new Pool(poolConfig);

const formatPgSql = (sql) => {
    let paramIndex = 1;
    let pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
    pgSql = pgSql.replace(/CURDATE\(\)/gi, 'CURRENT_DATE');
    pgSql = pgSql.replace(/NOW\(\)/gi, 'CURRENT_TIMESTAMP');
    pgSql = pgSql.replace(/DATE_SUB\(([^,]+),\s*INTERVAL\s*(\d+)\s*(\w+)\)/gi, (match, date, interval, unit) => `${date} - INTERVAL '${interval} ${unit}'`);
    pgSql = pgSql.replace(/`/g, '"');

    // Si c'est un INSERT sans RETURNING, on l'ajoute pour récupérer l'ID généré
    if (pgSql.trim().toUpperCase().startsWith('INSERT') && !pgSql.toUpperCase().includes('RETURNING')) {
        pgSql += ' RETURNING *';
    }
    return pgSql;
};

const formatResult = (result) => {
    let rows = [];
    if (result.rows && result.rows.length > 0) {
        rows = result.rows.map(row => {
            const upperRow = {};
            for (const key in row) {
                upperRow[key.toUpperCase()] = row[key];
            }
            return upperRow;
        });
    }

    if (result.command === 'INSERT' || result.command === 'UPDATE' || result.command === 'DELETE') {
        let insertId = null;
        if (rows.length > 0) {
            const firstRow = rows[0];
            const idKey = Object.keys(firstRow).find(k => k.startsWith('ID')) || Object.keys(firstRow)[0];
            insertId = firstRow[idKey];
        }
        const mysqlResult = {
            affectedRows: result.rowCount,
            insertId: insertId
        };
        return [mysqlResult, result.fields];
    }
    return [rows, result.fields];
};

const pool = {
    query: async (sql, params = []) => {
        const pgSql = formatPgSql(sql);
        const result = await pgPool.query(pgSql, params);
        return formatResult(result);
    },
    getConnection: async () => {
        const client = await pgPool.connect();

        return {
            query: async (sql, params = []) => {
                const pgSql = formatPgSql(sql);
                const result = await client.query(pgSql, params);
                return formatResult(result);
            },
            release: () => client.release(),
            beginTransaction: async () => await client.query('BEGIN'),
            commit: async () => await client.query('COMMIT'),
            rollback: async () => await client.query('ROLLBACK')
        };
    }
};

// Test de connexion
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Connexion à PostgreSQL réussie !');
        connection.release();
    } catch (error) {
        console.error('❌ Erreur de connexion à PostgreSQL :', error.message);
        process.exit(1);
    }
};

testConnection();

module.exports = pool;