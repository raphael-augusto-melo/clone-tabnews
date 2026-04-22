import database from "infra/database.js";

async function status(request, response) {
  const updatedAt = new Date().toISOString();

  const dbVersionResult = await database.query("SHOW server_version;");
  const dbVersionValue = dbVersionResult.rows[0].server_version;

  const dbMaxConnRes = await database.query("SHOW max_connections;");
  const dbMaxConnValue = dbMaxConnRes.rows[0].max_connections;

  const dbName = process.env.POSTGRES_DB;
  const dbOpenConnRes = await database.query({
    text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1",
    values: [dbName],
  });
  const dbOpenedConnValue = dbOpenConnRes.rows[0].count;

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: dbVersionValue,
        max_connections: parseInt(dbMaxConnValue),
        opened_connections: dbOpenedConnValue,
      },
    },
  });
}

export default status;
