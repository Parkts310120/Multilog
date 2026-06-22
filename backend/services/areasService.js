const supabase = require("../config/supabase");

async function listarAreasAtivas(){
  const { data, error } = await supabase
    .from("areas_operacionais")
    .select("*")
    .eq("ativo", true)
    .order("nome");

  if(error) throw new Error(error.message);

  return data;
}

async function listarAreasAdmin(){
  const { data, error } = await supabase
    .from("areas_operacionais")
    .select("id,nome,ativo")
    .order("nome");

  if(error) throw new Error(error.message);

  return data;
}

async function cadastrarArea(nome){
  const { error } = await supabase
    .from("areas_operacionais")
    .upsert({nome,ativo:true},{onConflict:"nome"});

  if(error) throw new Error(error.message);
}

async function cadastrarAreasEmMassa(itens){

  const registros = itens
    .map(nome => ({
      nome:String(nome).trim(),
      ativo:true
    }))
    .filter(x=>x.nome);

  const { error } = await supabase
    .from("areas_operacionais")
    .upsert(registros,{onConflict:"nome"});

  if(error) throw new Error(error.message);

  return registros.length;
}

module.exports = {
  listarAreasAtivas,
  listarAreasAdmin,
  cadastrarArea,
  cadastrarAreasEmMassa
};
