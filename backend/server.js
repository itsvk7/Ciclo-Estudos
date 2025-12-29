const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, "db.json");

app.use(express.json());

app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/materias", (req, res) => {
  const db = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  res.json(db);
});

app.post("/update", (req, res) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(req.body, null, 2));
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});