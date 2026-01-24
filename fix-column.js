const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("trades.db");

// ADD accountId COLUMN
db.run("ALTER TABLE trades ADD COLUMN accountId TEXT", (err) => {
  if (err) console.log("Column already exists");

  // UPDATE ALL TRADES TO 'default'
  db.run(
    "UPDATE trades SET accountId = 'default' WHERE accountId IS NULL",
    () => {
      // COUNT TRADES WITH accountId
      db.get(
        "SELECT COUNT(*) as count FROM trades WHERE accountId = 'default'",
        (_, row) => {
          console.log(`✅ ${row.count} TRADES FIXED TO 'default'`);
        }
      );

      // COUNT NULL accountId
      db.get(
        "SELECT COUNT(*) as count FROM trades WHERE accountId IS NULL",
        (_, row) => {
          console.log(`✅ ${row.count} NULL accountId LEFT`);
        }
      );

      db.close();
    }
  );
});
