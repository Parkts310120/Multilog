require("dotenv").config();

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { createClient } = require("@supabase/supabase-js");
const loginRoutes = require("./routes/loginRoutes");
const atividadesRoutes = require("./routes/atividadesRoutes");
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
// ADMIN - LISTAR USUÁRIOS
// =========================

app.get("/api/admin/usuarios", autenticarToken, autorizarAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("usuarios_sistema")
      .select("id,nome,usuario,tipo,ativo")
      .order("nome");

    if (error) {
      return res.status(500).json({
        sucesso: false,
        mensagem: error.message
      });
    }

    return res.json({
      sucesso: true,
      usuarios: data
    });

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao listar usuários"
    });
  }
});

// =========================
// ADMIN - CADASTRAR ADMIN
// =========================

app.post("/api/admin/usuarios", autenticarToken, autorizarAdmin, async (req, res) => {
  try {
    const { nome, usuario, senha } = req.body;

    if (!nome || !usuario || !senha) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Nome, usuário e senha são obrigatórios"
      });
    }

    const { error } = await supabase
      .from("usuarios_sistema")
      .upsert({
        nome,
        usuario,
        senha,
        tipo: "admin",
        ativo: true
      }, { onConflict: "usuario" });

    if (error) {
      return res.status(500).json({
        sucesso: false,
        mensagem: error.message
      });
    }

    return res.json({
      sucesso: true,
      mensagem: "Admin cadastrado com sucesso"
    });

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao cadastrar admin"
    });
  }
});

// =========================
// ADMIN - CADASTRAR EXECUTANTE
// =========================

app.post("/api/admin/executantes", autenticarToken, autorizarAdmin, async (req, res) => {
  try {
    const { nome, codigo } = req.body;

    if (!nome || !codigo) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Nome e matrícula são obrigatórios"
      });
    }

    const e1 = await supabase
      .from("executantes")
      .insert({ nome, codigo });

    if (e1.error) {
      return res.status(500).json({
        sucesso: false,
        mensagem: e1.error.message
      });
    }

    const e2 = await supabase
      .from("usuarios_sistema")
      .upsert({
        nome,
        usuario: codigo,
        senha: codigo,
        tipo: "funcionario",
        ativo: true
      }, { onConflict: "usuario" });

    if (e2.error) {
      return res.status(500).json({
        sucesso: false,
        mensagem: e2.error.message
      });
    }

    return res.json({
      sucesso: true,
      mensagem: `Executante cadastrado com sucesso. Login: ${codigo} | Senha: ${codigo}`
    });

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao cadastrar executante"
    });
  }
});

// =========================
// ADMIN - CADASTRAR DEPOSITANTE
// =========================
app.post("/api/admin/depositantes", autenticarToken, autorizarAdmin, async (req,res)=>{
  try{
    const {nome}=req.body;
    if(!nome)return res.status(400).json({sucesso:false,mensagem:"Nome do depositante é obrigatório"});
    const {error}=await supabase.from("depositantes").insert({nome,ativo:true});
    if(error)return res.status(500).json({sucesso:false,mensagem:error.message});
    return res.json({sucesso:true,mensagem:"Depositante cadastrado com sucesso"});
  }catch(erro){
    console.error(erro);
    return res.status(500).json({sucesso:false,mensagem:"Erro ao cadastrar depositante"});
  }
});

// =========================
// ADMIN - CADASTRAR SERVIÇO
// =========================
app.post("/api/admin/servicos", autenticarToken, autorizarAdmin, async (req,res)=>{
  try{
    const {nome}=req.body;
    if(!nome)return res.status(400).json({sucesso:false,mensagem:"Nome do serviço é obrigatório"});
    const {error}=await supabase.from("atividades_cadastro").insert({nome,ativo:true});
    if(error)return res.status(500).json({sucesso:false,mensagem:error.message});
    return res.json({sucesso:true,mensagem:"Serviço cadastrado com sucesso"});
  }catch(erro){
    console.error(erro);
    return res.status(500).json({sucesso:false,mensagem:"Erro ao cadastrar serviço"});
  }
});

// =========================
// ADMIN - LISTAR DEPOSITANTES
// =========================
app.get("/api/admin/depositantes", autenticarToken, autorizarAdmin, async (req,res)=>{
  try{
    const {data,error}=await supabase.from("depositantes").select("id,nome,ativo").order("nome");
    if(error)return res.status(500).json({sucesso:false,mensagem:error.message});
    return res.json({sucesso:true,depositantes:data});
  }catch(erro){
    console.error(erro);
    return res.status(500).json({sucesso:false,mensagem:"Erro ao listar depositantes"});
  }
});

// =========================
// ADMIN - LISTAR SERVIÇOS
// =========================
app.get("/api/admin/servicos", autenticarToken, autorizarAdmin, async (req,res)=>{
  try{
    const {data,error}=await supabase.from("atividades_cadastro").select("id,nome,ativo").order("nome");
    if(error)return res.status(500).json({sucesso:false,mensagem:error.message});
    return res.json({sucesso:true,servicos:data});
  }catch(erro){
    console.error(erro);
    return res.status(500).json({sucesso:false,mensagem:"Erro ao listar serviços"});
  }
});

// =========================
// ADMIN - CADASTRAR DEPOSITANTES EM MASSA
// =========================
app.post("/api/admin/depositantes/massa", autenticarToken, autorizarAdmin, async (req,res)=>{
  try{
    const {itens}=req.body;
    if(!Array.isArray(itens)||itens.length===0)return res.status(400).json({sucesso:false,mensagem:"Lista de depositantes vazia"});
    const registros=itens.map(nome=>({nome:String(nome).trim(),ativo:true})).filter(x=>x.nome);
    const {error}=await supabase.from("depositantes").upsert(registros,{onConflict:"nome"});
    if(error)return res.status(500).json({sucesso:false,mensagem:error.message});
    return res.json({sucesso:true,mensagem:`${registros.length} depositantes cadastrados`});
  }catch(erro){
    console.error(erro);
    return res.status(500).json({sucesso:false,mensagem:"Erro ao cadastrar depositantes em massa"});
  }
});

// =========================
// ADMIN - CADASTRAR SERVIÇOS EM MASSA
// =========================
app.post("/api/admin/servicos/massa", autenticarToken, autorizarAdmin, async (req,res)=>{
  try{
    const {itens}=req.body;
    if(!Array.isArray(itens)||itens.length===0)return res.status(400).json({sucesso:false,mensagem:"Lista de serviços vazia"});
    const registros=itens.map(nome=>({nome:String(nome).trim(),ativo:true})).filter(x=>x.nome);
    const {error}=await supabase.from("atividades_cadastro").upsert(registros,{onConflict:"nome"});
    if(error)return res.status(500).json({sucesso:false,mensagem:error.message});
    return res.json({sucesso:true,mensagem:`${registros.length} serviços cadastrados`});
  }catch(erro){
    console.error(erro);
    return res.status(500).json({sucesso:false,mensagem:"Erro ao cadastrar serviços em massa"});
  }
});

// =========================
// ADMIN - EXECUTANTES EM MASSA
// =========================

app.post("/api/admin/executantes/massa", autenticarToken, autorizarAdmin, async (req,res)=>{
  try{
    const {usuarios}=req.body;

    if(!Array.isArray(usuarios)||usuarios.length===0){
      return res.status(400).json({
        sucesso:false,
        mensagem:"Lista vazia"
      });
    }

    const executantes=usuarios.map(u=>({
      nome:u.nome,
      codigo:u.usuario
    }));

    const usuariosSistema=usuarios.map(u=>({
      nome:u.nome,
      usuario:u.usuario,
      senha:u.senha,
      tipo:"funcionario",
      ativo:true
    }));

    const e1=await supabase
      .from("executantes")
      .upsert(executantes,{onConflict:"codigo"});

    if(e1.error){
      return res.status(500).json({
        sucesso:false,
        mensagem:e1.error.message
      });
    }

    const e2=await supabase
      .from("usuarios_sistema")
      .upsert(usuariosSistema,{onConflict:"usuario"});

    if(e2.error){
      return res.status(500).json({
        sucesso:false,
        mensagem:e2.error.message
      });
    }

    return res.json({
      sucesso:true,
      mensagem:`${usuarios.length} funcionários cadastrados`
    });

  }catch(erro){
    console.error(erro);
    return res.status(500).json({
      sucesso:false,
      mensagem:"Erro ao cadastrar funcionários"
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
// ADMIN - LISTAR ÁREAS
// =========================
app.get("/api/admin/areas", autenticarToken, autorizarAdmin, async (req,res)=>{
  try{
    const {data,error}=await supabase
      .from("areas_operacionais")
      .select("id,nome,ativo")
      .order("nome");

    if(error)return res.status(500).json({sucesso:false,mensagem:error.message});

    return res.json({sucesso:true,areas:data});
  }catch(erro){
    console.error(erro);
    return res.status(500).json({sucesso:false,mensagem:"Erro ao listar áreas"});
  }
});

// =========================
// ADMIN - CADASTRAR ÁREA
// =========================
app.post("/api/admin/areas", autenticarToken, autorizarAdmin, async (req,res)=>{
  try{
    const {nome}=req.body;

    if(!nome){
      return res.status(400).json({
        sucesso:false,
        mensagem:"Nome da área é obrigatório"
      });
    }

    const {error}=await supabase
      .from("areas_operacionais")
      .upsert({nome,ativo:true},{onConflict:"nome"});

    if(error)return res.status(500).json({sucesso:false,mensagem:error.message});

    return res.json({
      sucesso:true,
      mensagem:"Área cadastrada com sucesso"
    });

  }catch(erro){
    console.error(erro);
    return res.status(500).json({sucesso:false,mensagem:"Erro ao cadastrar área"});
  }
});

// =========================
// ADMIN - CADASTRAR ÁREAS EM MASSA
// =========================
app.post("/api/admin/areas/massa", autenticarToken, autorizarAdmin, async (req,res)=>{
  try{
    const {itens}=req.body;

    if(!Array.isArray(itens)||itens.length===0){
      return res.status(400).json({
        sucesso:false,
        mensagem:"Lista de áreas vazia"
      });
    }

    const registros=itens
      .map(nome=>({nome:String(nome).trim(),ativo:true}))
      .filter(x=>x.nome);

    const {error}=await supabase
      .from("areas_operacionais")
      .upsert(registros,{onConflict:"nome"});

    if(error)return res.status(500).json({sucesso:false,mensagem:error.message});

    return res.json({
      sucesso:true,
      mensagem:`${registros.length} áreas cadastradas`
    });

  }catch(erro){
    console.error(erro);
    return res.status(500).json({sucesso:false,mensagem:"Erro ao cadastrar áreas"});
  }
});

// =========================
// START SERVER
// =========================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Multilog API rodando na porta ${PORT}`);
});