const express = require("express");
const supabase = require("../config/supabase");
const { autenticarToken, autorizarAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

// SALVAR ATIVIDADE
router.post("/atividades", autenticarToken, async (req, res) => {
  console.log("ATIVIDADE RECEBIDA:", req.body);

  try {
    const {
      usuario,
      depositante,
      atividade,
      area,
      lote,
      quantidade_esperada,
      quantidade_realizada,
      diferenca_quantidade,
      unidade,
      produtividade_hora,
      meta_hora,
      atingiu_meta,
      observacao,
      inicio,
      fim,
      duracao,
      duracao_segundos
    } = req.body;

    const { error } = await supabase
      .from("atividades")
      .insert({
        usuario,
        depositante,
        atividade,
        area,
        lote,
        quantidade: quantidade_realizada,
        quantidade_esperada,
        quantidade_realizada,
        diferenca_quantidade,
        unidade,
        produtividade_hora,
        meta_hora,
        atingiu_meta,
        observacao,
        inicio,
        fim,
        duracao,
        duracao_segundos,
        visivel: true
      });

    if (error) {
      return res.status(500).json({
        sucesso: false,
        mensagem: error.message
      });
    }

    return res.json({
      sucesso: true,
      mensagem: "Atividade salva com sucesso"
    });

  } catch (erro) {
    console.error(erro);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno"
    });
  }
});

// ADMIN - HISTÓRICO DE ATIVIDADES
router.get("/admin/atividades", autenticarToken, autorizarAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("atividades")
      .select("*")
      .eq("visivel", true)
      .order("id", { ascending: false });

    if (error) {
      return res.status(500).json({
        sucesso: false,
        mensagem: error.message
      });
    }

    return res.json({
      sucesso: true,
      atividades: data
    });

  } catch (erro) {
    console.error(erro);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao carregar histórico"
    });
  }
});

// ADMIN - OCULTAR UMA ATIVIDADE
router.patch("/admin/atividades/:id/ocultar", autenticarToken, autorizarAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("atividades")
      .update({ visivel: false })
      .eq("id", id);

    if (error) {
      return res.status(500).json({
        sucesso: false,
        mensagem: error.message
      });
    }

    return res.json({
      sucesso: true,
      mensagem: "Registro ocultado com sucesso"
    });

  } catch (erro) {
    console.error(erro);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao ocultar registro"
    });
  }
});

// ADMIN - OCULTAR TODO HISTÓRICO
router.patch("/admin/atividades/ocultar-todos", autenticarToken, autorizarAdmin, async (req, res) => {
  try {
    const { error } = await supabase
      .from("atividades")
      .update({ visivel: false })
      .eq("visivel", true);

    if (error) {
      return res.status(500).json({
        sucesso: false,
        mensagem: error.message
      });
    }

    return res.json({
      sucesso: true,
      mensagem: "Histórico ocultado com sucesso"
    });

  } catch (erro) {
    console.error(erro);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao ocultar histórico"
    });
  }
});

module.exports = router;
