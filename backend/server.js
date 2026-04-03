require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

require("./database");

const app = express();

app.use(
  cors({
    origin: "*",
  }),
);
app.use(express.json());

app.use(express.static('../'));

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../home.html'));
});

const fixturesRoute = require("./routes/fixtures");
const betsRoute = require("./routes/bets");
const authRoutes = require("./routes/auth");
app.use("/api/bets", betsRoute);
app.use("/api/auth", authRoutes);

app.get("/status", (req, res) => {
  res.send("<h1>O Servidor está Rodando</h1>");
});
app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});
