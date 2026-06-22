const supabase = require("../config/supabase");

async function salvarAtividade(dados){
  const { error } = await supabase
    .from("atividades")
    .insert({
      id_local: dados.id_local,
      usuario: dados.usuario,
      depositante: dados.depositante,
      atividade: dados.atividade,
      area: dados.area,
      lote: dados.lote,
      quantidade: dados.quantidade_realizada,
      quantidade_esperada: dados.quantidade_esperada,
      quantidade_realizada: dados.quantidade_realizada,
      diferenca_quantidade: dados.diferenca_quantidade,
      unidade: dados.unidade,
      produtividade_hora: dados.produtividade_hora,
      meta_hora: dados.meta_hora,
      atingiu_meta: dados.atingiu_meta,
      observacao: dados.observacao,
      inicio: dados.inicio,
      fim: dados.fim,
      duracao: dados.duracao,
      duracao_segundos: dados.duracao_segundos,
      visivel: true
    });

  if(error){
    throw new Error(error.message);
  }
}

async function listarAtividadesVisiveis(){
  const { data, error } = await supabase
    .from("atividades")
    .select("*")
    .eq("visivel", true)
    .order("id", { ascending: false });

  if(error){
    throw new Error(error.message);
  }

  return data;
}

async function ocultarAtividade(id){
  const { error } = await supabase
    .from("atividades")
    .update({ visivel: false })
    .eq("id", id);

  if(error){
    throw new Error(error.message);
  }
}

async function ocultarTodasAtividades(){
  const { error } = await supabase
    .from("atividades")
    .update({ visivel: false })
    .eq("visivel", true);

  if(error){
    throw new Error(error.message);
  }
}

module.exports = {
  salvarAtividade,
  listarAtividadesVisiveis,
  ocultarAtividade,
  ocultarTodasAtividades
};
