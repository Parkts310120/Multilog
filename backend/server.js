require("dotenv").config();

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { createClient } = require("@supabase/supabase-js");
const loginRoutes = require("./routes/loginRoutes");
const atividadesRoutes = require("./routes/atividadesRoutes");
const app = express();
const depositantesRoutes = require("./routes/depositantesRoutes");
const servicosRoutes = require("./routes/servicosRoutes");
const areasRoutes = require("./routes/areasRoutes");
const usuariosRoutes = require("./routes/usuariosRoutes");

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

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

function autenticarToken(req,res,next){
  const authHeader=req.headers["authorization"];
  const token=authHeader&&authHeader.split(" ")[1];

  if(!token){
    return res.status(401).json({
      sucesso:false,
      mensagem:"Token não informado"
    });
  }

  jwt.verify(token,process.env.JWT_SECRET,(erro,usuario)=>{
    if(erro){
      return res.status(403).json({
        sucesso:false,
        mensagem:"Token inválido ou expirado"
      });
    }

    req.usuario=usuario;
    next();
  });
}

function autorizarAdmin(req,res,next){
  if(!req.usuario||req.usuario.tipo!=="admin"){
    return res.status(403).json({
      sucesso:false,
      mensagem:"Acesso permitido apenas para administradores"
    });
  }

  next();
}

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
// DEPOSITANTES
// =========================

app.get("/api/depositantes", autenticarToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("depositantes")
      .select("*")
      .eq("ativo", true)
      .order("nome");

    if (error) {
      return res.status(500).json({
        sucesso: false,
        mensagem: error.message
      });
    }

    return res.json({
      sucesso: true,
      depositantes: data
    });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao carregar depositantes"
    });
  }
});

// =========================
// SERVIÇOS
// =========================

app.get("/api/servicos", autenticarToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("atividades_cadastro")
      .select("*")
      .eq("ativo", true)
      .order("nome");

    if (error) {
      return res.status(500).json({
        sucesso: false,
        mensagem: error.message
      });
    }

    return res.json({
      sucesso: true,
      servicos: data
    });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao carregar serviços"
    });
  }
});

// =========================
// ÁREAS OPERACIONAIS
// =========================

app.get("/api/areas", autenticarToken, async (req,res)=>{
  try{
    const {data,error}=await supabase
      .from("areas_operacionais")
      .select("*")
      .eq("ativo",true)
      .order("nome");

    if(error)return res.status(500).json({sucesso:false,mensagem:error.message});

    return res.json({sucesso:true,areas:data});
  }catch(erro){
    console.error(erro);
    return res.status(500).json({sucesso:false,mensagem:"Erro ao carregar áreas"});
  }
});

// =========================
// START SERVER
// =========================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Multilog API rodando na porta ${PORT}`);
});