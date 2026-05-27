const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Cria o arquivo "futebol.db" dentro da pasta database
const db = new sqlite3.Database(path.join(__dirname, "futebol.db"), (err) => {
  if (err) {
    console.error("Erro ao conectar ao SQLite:", err.message);
  } else {
    console.log("Conectado ao banco de dados SQLite com sucesso!");

    // Criando a tabela de usuários e JÁ INCLUINDO O SALDO para o futuro!
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            senha TEXT NOT NULL,
            saldo DECIMAL(10, 2) DEFAULT 100.00, 
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
  }
});

module.exports = db;
