let globalActivities=[];
let filteredActivities=[];

let chartDepositante=null;
let chartServico=null;
let chartUsuario=null;
let chartArea=null;
let chartProducaoDia=null;

document.addEventListener('DOMContentLoaded',loadActivitiesFromSupabase);

async function loadActivitiesFromSupabase(){

if(!verificarLogin()){
return;
}

try{

const resultado=await apiGet('/api/admin/atividades');

globalActivities=resultado.atividades.map(item=>({
id:item.id,
user:item.usuario,
depositor:item.depositante,
name:item.atividade,
area:item.area,
lote:item.lote,
quantidade_esperada:item.quantidade_esperada,
quantidade_realizada:item.quantidade_realizada,
diferenca_quantidade:item.diferenca_quantidade,
unidade:item.unidade,
observacao:item.observacao,
inicio_original:item.inicio,
fim_original:item.fim,
start:formatDateTime(new Date(item.inicio)),
end:formatDateTime(new Date(item.fim)),
duration:item.duracao,
duracao_segundos:item.duracao_segundos||0
}));

filteredActivities=[...globalActivities];

popularFiltros();
atualizarTela();

}catch(erro){
console.error(erro);
alert(erro.message||'Erro ao conectar com a API.');
}
}

function atualizarTela(){
renderReports();
renderCharts();
renderActivities();
}

function formatDateTime(dateObj){
const date=dateObj.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',year:'2-digit'});
const time=dateObj.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
return `${date} às ${time}`;
}

function formatDateOnly(dateObj){
return dateObj.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'});
}

function formatSeconds(seconds){
const hrs=Math.floor(seconds/3600);
const mins=Math.floor((seconds%3600)/60);
const secs=seconds%60;
return `${hrs}h ${mins}min ${secs}s`;
}

function popularFiltros(){
popularSelect('filtro-usuario',globalActivities.map(a=>a.user),'Todos os operadores');
popularSelect('filtro-depositante',globalActivities.map(a=>a.depositor),'Todos os depositantes');
popularSelect('filtro-area',globalActivities.map(a=>a.area),'Todas as áreas');
popularSelect('filtro-servico',globalActivities.map(a=>a.name),'Todos os serviços');
}

function popularSelect(id,valores,labelTodos){
const select=document.getElementById(id);
const unicos=[...new Set(valores.filter(v=>v&&String(v).trim()!==''))].sort();

select.innerHTML=`<option value="">${labelTodos}</option>`;

unicos.forEach(valor=>{
select.innerHTML+=`<option value="${valor}">${valor}</option>`;
});
}

function aplicarFiltros(){
const dataInicial=document.getElementById('filtro-data-inicial').value;
const dataFinal=document.getElementById('filtro-data-final').value;
const usuario=document.getElementById('filtro-usuario').value;
const depositante=document.getElementById('filtro-depositante').value;
const area=document.getElementById('filtro-area').value;
const servico=document.getElementById('filtro-servico').value;

filteredActivities=globalActivities.filter(act=>{
const dataAtividade=new Date(act.inicio_original);

if(dataInicial){
const inicioFiltro=new Date(dataInicial+'T00:00:00');
if(dataAtividade<inicioFiltro)return false;
}

if(dataFinal){
const fimFiltro=new Date(dataFinal+'T23:59:59');
if(dataAtividade>fimFiltro)return false;
}

if(usuario&&act.user!==usuario)return false;
if(depositante&&act.depositor!==depositante)return false;
if(area&&act.area!==area)return false;
if(servico&&act.name!==servico)return false;

return true;
});

atualizarTela();
}

function limparFiltros(){
document.getElementById('filtro-data-inicial').value='';
document.getElementById('filtro-data-final').value='';
document.getElementById('filtro-usuario').value='';
document.getElementById('filtro-depositante').value='';
document.getElementById('filtro-area').value='';
document.getElementById('filtro-servico').value='';

filteredActivities=[...globalActivities];

atualizarTela();
}

function calcularIndicadores(){
let totalSegundos=0;
let totalQuantidade=0;
let totalHoras=0;

const operadores=new Set();
const clientes=new Set();

filteredActivities.forEach(act=>{
const seg=act.duracao_segundos||0;
totalSegundos+=seg;
totalQuantidade+=Number(act.quantidade_realizada||0);
totalHoras+=seg/3600;

if(act.user)operadores.add(act.user);
if(act.depositor)clientes.add(act.depositor);
});

const produtividadeMedia=totalHoras>0 ? (totalQuantidade/totalHoras).toFixed(2) : 0;

return {
totalSegundos,
totalQuantidade,
totalHoras,
produtividadeMedia,
operadoresAtivos:operadores.size,
clientesAtendidos:clientes.size,
totalAtividades:filteredActivities.length
};
}

function renderReports(){
const kpiDiv=document.getElementById('kpi-container');
const reportsDiv=document.getElementById('admin-reports');

const indicadores=calcularIndicadores();

const usuarios={};
const depositantes={};
const servicos={};
const areas={};

filteredActivities.forEach(act=>{
const seg=act.duracao_segundos||0;

usuarios[act.user]=(usuarios[act.user]||0)+seg;
depositantes[act.depositor]=(depositantes[act.depositor]||0)+seg;
servicos[act.name]=(servicos[act.name]||0)+seg;
areas[act.area||'Sem área']=(areas[act.area||'Sem área']||0)+seg;
});

kpiDiv.innerHTML=`
<div class="kpi-grid">
<div class="kpi-card"><div class="kpi-title">📋 Atividades</div><div class="kpi-value">${indicadores.totalAtividades}</div></div>
<div class="kpi-card"><div class="kpi-title">⏱ Horas</div><div class="kpi-value">${indicadores.totalHoras.toFixed(2)}</div></div>
<div class="kpi-card"><div class="kpi-title">📦 Peças</div><div class="kpi-value">${indicadores.totalQuantidade}</div></div>
<div class="kpi-card"><div class="kpi-title">⚡ Produtividade</div><div class="kpi-value">${indicadores.produtividadeMedia}/h</div></div>
<div class="kpi-card"><div class="kpi-title">👷 Operadores</div><div class="kpi-value">${indicadores.operadoresAtivos}</div></div>
<div class="kpi-card"><div class="kpi-title">🏢 Clientes</div><div class="kpi-value">${indicadores.clientesAtendidos}</div></div>
</div>
`;

reportsDiv.innerHTML=`
<div class="time-row">
<div style="font-weight:bold;">⏱ Tempo total</div>
<div style="margin-left:auto;">${formatSeconds(indicadores.totalSegundos)}</div>
</div>

<hr style="margin:16px 0;border-color:#334155;">

<h4>🏆 Ranking por Usuário</h4>
${montarRanking(usuarios,'👤')}

<hr style="margin:16px 0;border-color:#334155;">

<h4>📦 Ranking por Depositante</h4>
${montarRanking(depositantes,'📦')}

<hr style="margin:16px 0;border-color:#334155;">

<h4>🛠️ Ranking por Serviço</h4>
${montarRanking(servicos,'🛠️')}

<hr style="margin:16px 0;border-color:#334155;">

<h4>🏭 Ranking por Área</h4>
${montarRanking(areas,'🏭')}
`;
}

function montarRanking(obj,icone){
return Object.entries(obj)
.filter(([nome,seg])=>seg>0)
.sort((a,b)=>b[1]-a[1])
.map(([nome,seg])=>`
<div class="time-row">
<div style="font-weight:bold;">${icone} ${nome}</div>
<div style="margin-left:auto;">${formatSeconds(seg)}</div>
</div>
`).join('')||'<div class="empty-state">Sem dados.</div>';
}

function agruparPorTempo(campo){
const obj={};

filteredActivities.forEach(act=>{
const nome=act[campo]||'Sem informação';
const seg=act.duracao_segundos||0;
obj[nome]=(obj[nome]||0)+seg;
});

return Object.entries(obj)
.filter(([nome,seg])=>seg>0)
.sort((a,b)=>b[1]-a[1])
.slice(0,10)
.map(([nome,seg])=>({
nome,
horas:Number((seg/3600).toFixed(2))
}));
}

function agruparProducaoPorDia(){
const obj={};

filteredActivities.forEach(act=>{
const dataObj=new Date(act.inicio_original);
const chave=dataObj.toISOString().slice(0,10);
const label=formatDateOnly(dataObj);
const quantidade=Number(act.quantidade_realizada||0);

if(!obj[chave]){
obj[chave]={label,quantidade:0};
}

obj[chave].quantidade+=quantidade;
});

return Object.entries(obj)
.sort((a,b)=>a[0].localeCompare(b[0]))
.map(([chave,dados])=>({
nome:dados.label,
quantidade:dados.quantidade
}));
}

function renderCharts(){
const depositantes=agruparPorTempo('depositor');
const servicos=agruparPorTempo('name');
const usuarios=agruparPorTempo('user');
const areas=agruparPorTempo('area');
const producaoDia=agruparProducaoPorDia();

chartProducaoDia=criarOuAtualizarGrafico(
chartProducaoDia,
'chart-producao-dia',
'bar',
producaoDia.map(d=>({nome:d.nome,valor:d.quantidade})),
'Produção por Dia',
false
);

chartDepositante=criarOuAtualizarGrafico(
chartDepositante,
'chart-depositante',
'bar',
depositantes.map(d=>({nome:d.nome,valor:d.horas})),
'Tempo por Depositante',
true
);

chartServico=criarOuAtualizarGrafico(
chartServico,
'chart-servico',
'bar',
servicos.map(d=>({nome:d.nome,valor:d.horas})),
'Tempo por Serviço',
true
);

chartUsuario=criarOuAtualizarGrafico(
chartUsuario,
'chart-usuario',
'bar',
usuarios.map(d=>({nome:d.nome,valor:d.horas})),
'Tempo por Operador',
true
);

chartArea=criarOuAtualizarGrafico(
chartArea,
'chart-area',
'bar',
areas.map(d=>({nome:d.nome,valor:d.horas})),
'Tempo por Área',
true
);
}

function criarOuAtualizarGrafico(chartAtual,canvasId,tipo,dados,label,horizontal){
const ctx=document.getElementById(canvasId);

if(chartAtual){
chartAtual.destroy();
}

return new Chart(ctx,{
type:tipo,
data:{
labels:dados.map(d=>d.nome),
datasets:[{
label:label,
data:dados.map(d=>d.valor),
borderWidth:1
}]
},
options:{
indexAxis:horizontal?'y':'x',
responsive:true,
plugins:{
legend:{
labels:{color:'#f8fafc'}
}
},
scales:{
x:{
ticks:{color:'#f8fafc'},
grid:{color:'#334155'},
beginAtZero:true
},
y:{
ticks:{color:'#f8fafc'},
grid:{color:'#334155'},
beginAtZero:true
}
}
}
});
}

function renderActivities(){
const container=document.getElementById('history-container');
container.innerHTML='';

if(filteredActivities.length===0){
container.innerHTML='<div class="empty-state">Nenhuma atividade encontrada com os filtros aplicados.</div>';
return;
}

filteredActivities.forEach(act=>{
const div=document.createElement('div');
div.className='activity-item';

let blocoQuantidade='';

if(act.quantidade_esperada!==null&&act.quantidade_esperada!==undefined){
blocoQuantidade+=`
<div class="time-row"><div class="time-label">Esperado:</div><div>${act.quantidade_esperada}</div></div>
`;
}

if(act.quantidade_realizada!==null&&act.quantidade_realizada!==undefined){
blocoQuantidade+=`
<div class="time-row"><div class="time-label">Realizado:</div><div>${act.quantidade_realizada}</div></div>
`;
}

if(act.diferenca_quantidade!==null&&act.diferenca_quantidade!==undefined){
blocoQuantidade+=`
<div class="time-row"><div class="time-label">Diferença:</div><div>${act.diferenca_quantidade}</div></div>
`;
}

if(act.observacao){
blocoQuantidade+=`
<div class="time-row"><div class="time-label">Obs.:</div><div>${act.observacao}</div></div>
`;
}

div.innerHTML=`
<div class="activity-name">${act.name}</div>
<div class="time-row"><div class="time-label">Usuário:</div><div>${act.user}</div></div>
<div class="time-row"><div class="time-label">Dep.:</div><div>${act.depositor}</div></div>
<div class="time-row"><div class="time-label">Área:</div><div>${act.area||'-'}</div></div>
<div class="time-row"><div class="time-label">Lote:</div><div>${act.lote||'-'}</div></div>
<div class="time-row"><div class="time-label">Início:</div><div>${act.start}</div></div>
<div class="time-row"><div class="time-label">Fim:</div><div>${act.end}</div></div>
${blocoQuantidade}
<div class="duration-box">⏱️ Tempo total: ${act.duration}</div>
<button class="btn-danger" onclick="deleteSingleItem(${act.id})">Ocultar Registro</button>
`;

container.appendChild(div);
});
}

async function deleteSingleItem(id){
if(!confirm('Deseja ocultar este registro? Ele continuará salvo no banco.'))return;

try{

await apiPatch(`/api/admin/atividades/${id}/ocultar`);

await loadActivitiesFromSupabase();

}catch(erro){
console.error(erro);
alert(erro.message||'Erro ao conectar com a API.');
}
}

async function clearHistory(){
if(!confirm('Deseja ocultar todo o histórico? Os dados continuarão no banco.'))return;

try{

await apiPatch('/api/admin/atividades/ocultar-todos');

await loadActivitiesFromSupabase();

alert('Histórico ocultado da tela.');

}catch(erro){
console.error(erro);
alert(erro.message||'Erro ao conectar com a API.');
}
}

function exportCSV(){
let csv='ID,Usuario,Depositante,Servico,Area,Lote,Quantidade Esperada,Quantidade Realizada,Diferenca,Unidade,Observacao,Inicio,Fim,Duracao,Duracao Segundos\n';

filteredActivities.forEach(act=>{
csv+=`"${act.id}","${act.user||''}","${act.depositor||''}","${act.name||''}","${act.area||''}","${act.lote||''}","${act.quantidade_esperada??''}","${act.quantidade_realizada??''}","${act.diferenca_quantidade??''}","${act.unidade||''}","${act.observacao||''}","${act.start||''}","${act.end||''}","${act.duration||''}","${act.duracao_segundos||0}"\n`;
});

const blob=new Blob(["\uFEFF"+csv],{type:'text/csv;charset=utf-8;'});
const link=document.createElement('a');
link.href=URL.createObjectURL(blob);

const agora=new Date();
const data=agora.toISOString().slice(0,10);
link.download=`relatorio_atividades_${data}.csv`;

link.click();
}
