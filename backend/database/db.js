const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath = path.resolve(__dirname, "..", process.env.DB_FILE || "./database/ipgrade.sqlite");
const schemaPath = path.join(__dirname, "schema.sql");

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new sqlite3.Database(dbPath);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (error) {
      if (error) {
        reject(error);
        return;
      }
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, function (error, row) {
      if (error) {
        reject(error);
        return;
      }
      resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, function (error, rows) {
      if (error) {
        reject(error);
        return;
      }
      resolve(rows);
    });
  });
}

function exec(sql) {
  return new Promise((resolve, reject) => {
    db.exec(sql, function (error) {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

async function transaction(callback) {
  await run("BEGIN TRANSACTION");
  try {
    const result = await callback();
    await run("COMMIT");
    return result;
  } catch (error) {
    await run("ROLLBACK");
    throw error;
  }
}

async function initDb() {
  await exec("PRAGMA foreign_keys = ON");
  await exec(fs.readFileSync(schemaPath, "utf8"));
}

module.exports = {
  db,
  run,
  get,
  all,
  exec,
  transaction,
  initDb
};
