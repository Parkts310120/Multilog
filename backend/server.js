require("dotenv").config();

const express = require("express");
const cors = require("cors");

const loginRoutes = require("./routes/loginRoutes");
const atividadesRoutes = require("./routes/atividadesRoutes");
const depositantesRoutes = require("./routes/depositantesRoutes");
const servicosRoutes = require("./routes/servicosRoutes");
const areasRoutes = require("./routes/areasRoutes");
const usuariosRoutes = require("./routes/usuariosRoutes");

const app = express();

app.use((req,res,next)=>{
  res.header("Access-Control-Allow-Origin","*");
  res.header("Access-Control-Allow-Methods","GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers","Content-Type, Authorization");

  if(req.method==="OPTIONS"){
    return res.sendStatus(200);
  }

  next();
});

app.use(cors());

app.options(/.*/,cors());

app.use(express.json());

app.use("/api", loginRoutes);
app.use("/api", atividadesRoutes);
app.use("/api", depositantesRoutes);
app.use("/api", servicosRoutes);
app.use("/api", areasRoutes);
app.use("/api", usuariosRoutes);

// =========================
// STATUS API
// =========================

app.get("/api/status", (req, res) => {
  res.json({
    sistema: "Multilog API",
    status: "ONLINE",
    data: new Date()
  });
});

// =========================
// START SERVER
// =========================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Multilog API rodando na porta ${PORT}`);
});