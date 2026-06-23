const supabase = require("../config/supabase");

async function registrarLog({ usuario, acao, tabela, registro_id = null, antes = null, depois = null }) {
  const { error } = await supabase
    .from("logs_auditoria")
    .insert({
      usuario,
      acao,
      tabela,
      registro_id,
      antes,
      depois
    });

  if (error) {
    console.error("Erro ao registrar auditoria:", error.message);
  }
}

async function listarLogs() {
  const { data, error } = await supabase
    .from("logs_auditoria")
    .select("*")
    .order("criado_em", { ascending: false })
    .limit(1000);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

module.exports = {
  registrarLog,
  listarLogs
};