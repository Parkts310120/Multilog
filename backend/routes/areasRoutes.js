const express = require("express");
const supabase = require("../config/supabase");
const { autenticarToken, autorizarAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/areas", autenticarToken, async (req,res)=>{
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

router.get("/admin/areas", autenticarToken, autorizarAdmin, async (req,res)=>{
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

router.post("/admin/areas", autenticarToken, autorizarAdmin, async (req,res)=>{
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

router.post("/admin/areas/massa", autenticarToken, autorizarAdmin, async (req,res)=>{
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

module.exports = router;
