const express = require("express");
const jwt = require("jsonwebtoken");
const supabase = require("../config/supabase");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { usuario, senha } = req.body;

    if (!usuario || !senha) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Usuário e senha obrigatórios"
      });
    }

    const { data, error } = await supabase
      .from("usuarios_sistema")
      .select("*")
      .eq("usuario", usuario)
      .eq("senha", senha)
      .eq("ativo", true)
      .single();

    if (error || !data) {
      return res.status(401).json({
        sucesso: false,
        mensagem: "Usuário ou senha inválidos"
      });
    }

    const token = jwt.sign(
      {
        id: data.id,
        usuario: data.usuario,
        nome: data.nome,
        tipo: data.tipo
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    return res.json({
      sucesso: true,
      token,
      usuario: {
        id: data.id,
        nome: data.nome,
        usuario: data.usuario,
        tipo: data.tipo
      }
    });

  } catch (erro) {
    console.error(erro);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno"
    });
  }
});

module.exports = router;
