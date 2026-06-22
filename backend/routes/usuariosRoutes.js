const express = require("express");
const supabase = require("../config/supabase");
const { autenticarToken, autorizarAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/admin/usuarios", autenticarToken, autorizarAdmin, async (req, res) => {
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

router.post("/admin/usuarios", autenticarToken, autorizarAdmin, async (req, res) => {
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

router.post("/admin/executantes", autenticarToken, autorizarAdmin, async (req, res) => {
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

router.post("/admin/executantes/massa", autenticarToken, autorizarAdmin, async (req,res)=>{
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

module.exports = router;
