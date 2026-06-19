let globalActivities = [];
let filteredActivities = [];

let chartProducaoDia;
let chartCliente;
let chartOperador;
let chartArea;
let chartServico;

document.addEventListener(
'DOMContentLoaded',
loadActivities
);

async function loadActivities(){

if(!verificarLogin()){
return;
}

try{

const resultado=await apiGet('/api/admin/atividades');

globalActivities=
resultado.atividades.map(item=>({

id:item.id,
usuario:item.usuario,
depositante:item.depositante,
servico:item.atividade,
area:item.area,
quantidade:Number(item.quantidade_realizada||0),
segundos:Number(item.duracao_segundos||0),
inicio:new Date(item.inicio)

}));

filteredActivities=[...globalActivities];

popularFiltros();

atualizarDashboard();

}catch(erro){

console.error(erro);

alert(
'Erro ao conectar com API.'
);

}

}

function popularFiltros(){

popularSelect(
'filtro-usuario',
globalActivities.map(x=>x.usuario),
'Todos'
);

popularSelect(
'filtro-depositante',
globalActivities.map(x=>x.depositante),
'Todos'
);

popularSelect(
'filtro-area',
globalActivities.map(x=>x.area),
'Todas'
);

popularSelect(
'filtro-servico',
globalActivities.map(x=>x.servico),
'Todos'
);

}

function popularSelect(
id,
valores,
texto
){

const select=
document.getElementById(id);

const lista=
[...new Set(
valores.filter(
v=>v
)
)].sort();

select.innerHTML=
`<option value="">${texto}</option>`;

lista.forEach(item=>{

select.innerHTML+=
`<option value="${item}">
${item}
</option>`;

});

}

function aplicarFiltros(){

const usuario=
document.getElementById(
'filtro-usuario'
).value;

const depositante=
document.getElementById(
'filtro-depositante'
).value;

const area=
document.getElementById(
'filtro-area'
).value;

const servico=
document.getElementById(
'filtro-servico'
).value;

const dataInicial=
document.getElementById(
'filtro-data-inicial'
).value;

const dataFinal=
document.getElementById(
'filtro-data-final'
).value;

filteredActivities=
globalActivities.filter(item=>{

if(
usuario &&
item.usuario!==usuario
)return false;

if(
depositante &&
item.depositante!==depositante
)return false;

if(
area &&
item.area!==area
)return false;

if(
servico &&
item.servico!==servico
)return false;

if(dataInicial){

const inicio=
new Date(dataInicial);

if(item.inicio<inicio)
return false;

}

if(dataFinal){

const fim=
new Date(dataFinal);

fim.setHours(
23,59,59
);

if(item.inicio>fim)
return false;

}

return true;

});

atualizarDashboard();

}

function atualizarDashboard(){

renderKPIs();

renderRankings();

renderCharts();

}

function renderKPIs(){

const totalAtividades=
filteredActivities.length;

const totalPecas=
filteredActivities.reduce(
(a,b)=>a+b.quantidade,
0
);

const totalHoras=
(
filteredActivities.reduce(
(a,b)=>a+b.segundos,
0
)
/3600
);

const produtividade=
totalHoras>0
?
(totalPecas/totalHoras)
.toFixed(2)
:
0;

const operadores=
new Set(
filteredActivities.map(
x=>x.usuario
)
).size;

const clientes=
new Set(
filteredActivities.map(
x=>x.depositante
)
).size;

document.getElementById(
'kpi-container'
).innerHTML=`

<div class="kpi-card">
<div class="kpi-title">
📦 Peças
</div>
<div class="kpi-value">
${totalPecas}
</div>
</div>

<div class="kpi-card">
<div class="kpi-title">
⏱ Horas
</div>
<div class="kpi-value">
${totalHoras.toFixed(2)}
</div>
</div>

<div class="kpi-card">
<div class="kpi-title">
⚡ Produtividade/h
</div>
<div class="kpi-value">
${produtividade}
</div>
</div>

<div class="kpi-card">
<div class="kpi-title">
📋 Atividades
</div>
<div class="kpi-value">
${totalAtividades}
</div>
</div>

<div class="kpi-card">
<div class="kpi-title">
👷 Operadores
</div>
<div class="kpi-value">
${operadores}
</div>
</div>

<div class="kpi-card">
<div class="kpi-title">
🏢 Clientes
</div>
<div class="kpi-value">
${clientes}
</div>
</div>

`;

}

function agruparPorCampo(campo){

const obj={};

filteredActivities.forEach(item=>{

const nome=
item[campo] || 'Sem informação';

if(!obj[nome]){
obj[nome]={
quantidade:0,
segundos:0
};
}

obj[nome].quantidade+=item.quantidade;
obj[nome].segundos+=item.segundos;

});

return Object.entries(obj)
.map(([nome,dados])=>({
nome,
quantidade:dados.quantidade,
segundos:dados.segundos,
horas:Number((dados.segundos/3600).toFixed(2))
}))
.sort((a,b)=>b.segundos-a.segundos);

}

function renderRankings(){

renderRanking(
'ranking-operadores',
agruparPorCampo('usuario')
);

renderRanking(
'ranking-clientes',
agruparPorCampo('depositante')
);

renderRanking(
'ranking-areas',
agruparPorCampo('area')
);

renderRanking(
'ranking-servicos',
agruparPorCampo('servico')
);

}

function renderRanking(id,dados){

const container=
document.getElementById(id);

const top=
dados
.filter(x=>x.segundos>0)
.slice(0,10);

if(top.length===0){
container.innerHTML=
'<div style="color:#94a3b8;">Sem dados.</div>';
return;
}

container.innerHTML=
top.map((item,index)=>`

<div class="rank-row">
<div class="rank-name">
${index+1}. ${item.nome}
</div>
<div class="rank-value">
${formatHoras(item.segundos)}
</div>
</div>

`).join('');

}

function formatHoras(segundos){

const horas=
Math.floor(segundos/3600);

const minutos=
Math.floor((segundos%3600)/60);

return `${horas}h ${minutos}min`;

}

function periodoHoje(){

const hoje=
new Date();

const data=
toInputDate(hoje);

document.getElementById(
'filtro-data-inicial'
).value=data;

document.getElementById(
'filtro-data-final'
).value=data;

aplicarFiltros();

}

function periodoOntem(){

const ontem=
new Date();

ontem.setDate(
ontem.getDate()-1
);

const data=
toInputDate(ontem);

document.getElementById(
'filtro-data-inicial'
).value=data;

document.getElementById(
'filtro-data-final'
).value=data;

aplicarFiltros();

}

function periodo7Dias(){

const hoje=
new Date();

const inicio=
new Date();

inicio.setDate(
hoje.getDate()-6
);

document.getElementById(
'filtro-data-inicial'
).value=toInputDate(inicio);

document.getElementById(
'filtro-data-final'
).value=toInputDate(hoje);

aplicarFiltros();

}

function periodo30Dias(){

const hoje=
new Date();

const inicio=
new Date();

inicio.setDate(
hoje.getDate()-29
);

document.getElementById(
'filtro-data-inicial'
).value=toInputDate(inicio);

document.getElementById(
'filtro-data-final'
).value=toInputDate(hoje);

aplicarFiltros();

}

function periodoMesAtual(){

const hoje=
new Date();

const inicio=
new Date(
hoje.getFullYear(),
hoje.getMonth(),
1
);

document.getElementById(
'filtro-data-inicial'
).value=toInputDate(inicio);

document.getElementById(
'filtro-data-final'
).value=toInputDate(hoje);

aplicarFiltros();

}

function periodoAno(){

const hoje=
new Date();

const inicio=
new Date(
hoje.getFullYear(),
0,
1
);

document.getElementById(
'filtro-data-inicial'
).value=toInputDate(inicio);

document.getElementById(
'filtro-data-final'
).value=toInputDate(hoje);

aplicarFiltros();

}

function toInputDate(date){

return date
.toISOString()
.slice(0,10);

}

function agruparProducaoPorDia(){

const obj={};

filteredActivities.forEach(item=>{

const chave=
toInputDate(item.inicio);

if(!obj[chave]){
obj[chave]=0;
}

obj[chave]+=item.quantidade;

});

return Object.entries(obj)
.sort((a,b)=>a[0].localeCompare(b[0]))
.map(([data,quantidade])=>({
nome:formatDataCurta(data),
valor:quantidade
}));

}

function formatDataCurta(data){

const partes=
data.split('-');

return `${partes[2]}/${partes[1]}`;

}

function renderCharts(){

const producaoDia=
agruparProducaoPorDia();

const clientes=
agruparPorCampo('depositante')
.filter(x=>x.segundos>0)
.slice(0,10)
.map(x=>({
nome:x.nome,
valor:x.horas
}));

const operadores=
agruparPorCampo('usuario')
.filter(x=>x.segundos>0)
.slice(0,10)
.map(x=>({
nome:x.nome,
valor:x.horas
}));

const areas=
agruparPorCampo('area')
.filter(x=>x.segundos>0)
.slice(0,10)
.map(x=>({
nome:x.nome,
valor:x.horas
}));

const servicos=
agruparPorCampo('servico')
.filter(x=>x.segundos>0)
.slice(0,10)
.map(x=>({
nome:x.nome,
valor:x.horas
}));

chartProducaoDia=
criarGrafico(
chartProducaoDia,
'chart-producao-dia',
producaoDia,
'Peças por dia',
false
);

chartCliente=
criarGrafico(
chartCliente,
'chart-cliente',
clientes,
'Horas por cliente',
true
);

chartOperador=
criarGrafico(
chartOperador,
'chart-operador',
operadores,
'Horas por operador',
true
);

chartArea=
criarGrafico(
chartArea,
'chart-area',
areas,
'Horas por área',
true
);

chartServico=
criarGrafico(
chartServico,
'chart-servico',
servicos,
'Horas por serviço',
true
);

}

function criarGrafico(
chartAtual,
canvasId,
dados,
label,
horizontal
){

const ctx=
document.getElementById(canvasId);

if(chartAtual){
chartAtual.destroy();
}

return new Chart(ctx,{
type:'bar',
data:{
labels:dados.map(x=>x.nome),
datasets:[{
label,
data:dados.map(x=>x.valor),
borderWidth:1
}]
},
options:{
indexAxis:horizontal?'y':'x',
responsive:true,
plugins:{
legend:{
labels:{
color:'#f8fafc'
}
}
},
scales:{
x:{
ticks:{
color:'#f8fafc'
},
grid:{
color:'#334155'
},
beginAtZero:true
},
y:{
ticks:{
color:'#f8fafc'
},
grid:{
color:'#334155'
},
beginAtZero:true
}
}
}
});

}
