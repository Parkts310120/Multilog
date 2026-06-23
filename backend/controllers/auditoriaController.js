const auditoriaService = require("../services/auditoriaService");

async function listarLogs(req, res) {
  try {
    const logs = await auditoriaService.listarLogs();

    return res.json({
      sucesso: true,
      logs
    });
  } catch (erro) {
    console.error(erro);

    return res.status(erro.statusCode || 500).json({
      sucesso: false,
      mensagem: erro.message || "Erro ao listar auditoria"
    });
  }
}

module.exports = {
  listarLogs
};
