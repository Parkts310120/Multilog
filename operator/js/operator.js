let usuarioLogado=null;
let currentSession=null;
let timerInterval=null;

function validarAcessoOperador() {
    const usuarioSalvo = localStorage.getItem("multilog_usuario");

    if (!usuarioSalvo || usuarioSalvo === "undefined") return true;

    const usuario = JSON.parse(usuarioSalvo);

    if (usuario.tipo === "admin") {
        localStorage.removeItem("multilog_token");
        localStorage.removeItem("multilog_usuario");
        return true;
    }

    return true;
}

document.addEventListener('DOMContentLoaded',()=>{
    if (!validarAcessoOperador()) return;
    const usuarioSalvo=localStorage.getItem('multilog_usuario');
    const token=localStorage.getItem('multilog_token');

    if(usuarioSalvo && usuarioSalvo !== "undefined" && token){
        usuarioLogado=JSON.parse(usuarioSalvo);
        showAppScreen();
    }else{
        localStorage.removeItem('multilog_usuario');
        localStorage.removeItem('multilog_token');
        showLoginScreen();
    }

    atualizarIndicadorOffline();

    setInterval(() => {
        atualizarIndicadorOffline();
    }, 5000);

    window.addEventListener('online', atualizarIndicadorOffline);
    window.addEventListener('offline', atualizarIndicadorOffline);    

});

async function handleLogin(){
    const userIn=document.getElementById('login-username').value.trim();
    const passIn=document.getElementById('login-password').value.trim();
    const errorEl=document.getElementById('login-error');

    try{
        const resultado=await apiPost('/api/login',{
            usuario:userIn,
            senha:passIn
        });

        localStorage.setItem('multilog_token',resultado.token);
        localStorage.setItem('multilog_usuario',JSON.stringify(resultado.usuario));
        localStorage.setItem('multilog_ultimo_login', userIn);
        localStorage.setItem('multilog_usuario_offline',JSON.stringify(resultado.usuario));
        localStorage.setItem('multilog_senha_offline', passIn);

        if (resultado.usuario.tipo === "admin") {
            Toast.error("Administradores devem acessar pela área administrativa.");
            return;
        }

        usuarioLogado=resultado.usuario;
        errorEl.style.display='none';
        showAppScreen();

    }catch(erro){
        const ultimoLogin = localStorage.getItem('multilog_ultimo_login');
        const usuarioSalvo = localStorage.getItem('multilog_usuario_offline');
        const senhaOffline = localStorage.getItem('multilog_senha_offline');
        if(
            usuarioSalvo &&
            ultimoLogin &&
            senhaOffline &&
            userIn === ultimoLogin &&
            passIn === senhaOffline
        ){
            const usuarioOffline = JSON.parse(usuarioSalvo);

            if (usuarioOffline.tipo === "admin") {
                Toast.error("Administradores devem acessar pela área administrativa.");
                return;
            }

            usuarioLogado = usuarioOffline;
            errorEl.style.display='none';
            Toast.warning('Login offline. Utilizando último usuário autenticado.');
            showAppScreen();
            return;
        }

        if(!navigator.onLine || erro.message === "API indisponível" || erro.message === "Erro na API"){
            errorEl.innerText='Sem API. Login offline não autorizado para este usuário ou senha.';
        }else{
            errorEl.innerText=erro.message||'Usuário ou senha incorretos!';
        }
        errorEl.style.display='block';
        console.error(erro);
    }
}

function handleLogout(){
    if(currentSession){
        Toast.warning('Finalize a atividade em andamento antes de sair!');
        return;
    }

    localStorage.removeItem('multilog_token');
    localStorage.removeItem('multilog_usuario');

    showLoginScreen();
}

async function atualizarIndicadorOffline(){
    const statusEl=document.getElementById('offline-status');

    if(!statusEl)return;

    let pendentes=0;
    let apiOnline=false;

    try{
        pendentes=await contarOffline();
    }catch(erro){
        console.error('Erro ao contar atividades offline:', erro);
    }

    if(!navigator.onLine){
        if(pendentes>0){
            statusEl.innerText=`🔴 Offline (${pendentes} pendentes)`;
        }else{
            statusEl.innerText='🔴 Offline';
        }

        return;
    }

    if(typeof verificarStatusAPI==="function"){
        apiOnline=await verificarStatusAPI();
    }

    if(!apiOnline){
        if(pendentes>0){
            statusEl.innerText=`🟡 Sem API: contate o T.I (${pendentes} pendentes)`;
        }else{
            statusEl.innerText='🟡 Sem API: contate o T.I';
        }

        return;
    }

    if(pendentes>0){
        statusEl.innerText=`🟢 Online (${pendentes} pendentes)`;

        if(typeof sincronizarPendentes==="function"){
            await sincronizarPendentes();
        }
    }else{
        statusEl.innerText='🟢 Online';
    }

    if(usuarioLogado && usuarioLogado.tipo !== 'admin'){
        const depSelect=document.getElementById('depositor-name');
        const ativSelect=document.getElementById('activity-name');
        const areaSelect=document.getElementById('area-name');

        const selectsVazios =
            depSelect &&
            ativSelect &&
            areaSelect &&
            depSelect.options.length === 0 &&
            ativSelect.options.length === 0 &&
            areaSelect.options.length === 0;

        if(selectsVazios){
            await carregarCadastros();
        }
    }
}

function showLoginScreen(){
    usuarioLogado=null;
    currentSession=null;
    clearInterval(timerInterval);

    mostrarTelaOperador('login-screen');
    
    document.getElementById('admin-buttons').style.display='none';
    document.getElementById('tracking-card').style.display='block';
}

function showAppScreen(){
    const executanteLogado = document.getElementById("executante-logado");

    if (executanteLogado && usuarioLogado) {
        executanteLogado.value = usuarioLogado.nome + " (" + usuarioLogado.usuario + ")";
    }
    const isAdmin = usuarioLogado && usuarioLogado.tipo === "admin";

    if (isAdmin) {
        mostrarTelaOperador("app-screen");
    } else {
        mostrarTelaOperador("menu-screen");
    }

    if(isAdmin){
        document.getElementById('app-title').innerText='Portal Administrativo';
        document.getElementById('app-subtitle').innerText='Acesse histórico, relatórios e cadastros';
        document.getElementById('tracking-card').style.display='none';
        document.getElementById('admin-buttons').style.display='block';
    }else{
        document.getElementById('app-title').innerText='Registro de Atividade';
        document.getElementById('app-subtitle').innerText='Selecione os dados cadastrados e registre o tempo';
        document.getElementById('tracking-card').style.display='block';
        document.getElementById('admin-buttons').style.display='none';
        initAppLogic();
    }
}

async function initAppLogic(){
    document.getElementById('depositor-name').disabled=false;
    document.getElementById('activity-name').disabled=false;
    document.getElementById('area-name').disabled=false;
    document.getElementById('lote').disabled=false;
    document.getElementById('tem-quantidade-esperada').disabled=false;
    document.getElementById('quantidade-esperada').disabled=false;
    document.getElementById('unidade').disabled=false;
    document.getElementById('quantidade-realizada').disabled=false;
    document.getElementById('observacao').disabled=false;

    document.getElementById('grupo-quantidade-realizada').style.display='none';
    document.getElementById('grupo-observacao').style.display='none';

    document.getElementById('btn-start').disabled=false;
    document.getElementById('btn-end').disabled=true;
    document.getElementById('btn-pause').disabled=true;
    document.getElementById('btn-pause').innerText='PAUSAR';

    alternarQuantidadeEsperada();

    clearInterval(timerInterval);
    updateStatusUI(false);

    await carregarCadastros();
}

async function carregarCadastros(){
    const depSelect=document.getElementById('depositor-name');
    const ativSelect=document.getElementById('activity-name');
    const areaSelect=document.getElementById('area-name');

    try{
        const [resultDepositantes,resultServicos,resultAreas]=await Promise.all([
            apiGet('/api/depositantes'),
            apiGet('/api/servicos'),
            apiGet('/api/areas')
        ]);

        const depositantes=resultDepositantes.depositantes;
        const servicos=resultServicos.servicos;
        const areas=resultAreas.areas;

        await salvarCadastrosOffline('depositantes', depositantes);
        await salvarCadastrosOffline('servicos', servicos);
        await salvarCadastrosOffline('areas', areas);

        preencherSelectsCadastros(depositantes, servicos, areas);

    }catch(erro){
        console.error(erro);

        const depositantes=await carregarCadastrosOffline('depositantes');
        const servicos=await carregarCadastrosOffline('servicos');
        const areas=await carregarCadastrosOffline('areas');

        preencherSelectsCadastros(depositantes, servicos, areas);

        if(
            depositantes.length > 0 ||
            servicos.length > 0 ||
            areas.length > 0
        ){
            console.log("Cadastros carregados do cache local.");
        }else{
            Toast.error("Sem conexão com a API e nenhum cadastro foi encontrado no dispositivo.");
        }

    }
}

function preencherSelectsCadastros(depositantes, servicos, areas){
    const depSelect=document.getElementById('depositor-name');
    const ativSelect=document.getElementById('activity-name');
    const areaSelect=document.getElementById('area-name');

    depSelect.innerHTML='';
    ativSelect.innerHTML='';
    areaSelect.innerHTML='';

    if(!depositantes||depositantes.length===0){
        depSelect.innerHTML='<option value="">Nenhum depositante disponível</option>';
    }else{
        depSelect.innerHTML='<option value="">Selecione o depositante</option>';
        depositantes.forEach(d=>{
            depSelect.innerHTML+=`<option value="${d.nome}">${d.nome}</option>`;
        });
    }

    if(!servicos||servicos.length===0){
        ativSelect.innerHTML='<option value="">Nenhum serviço disponível</option>';
    }else{
        ativSelect.innerHTML='<option value="">Selecione o serviço</option>';
        servicos.forEach(s=>{
            ativSelect.innerHTML+=`<option value="${s.nome}">${s.nome}</option>`;
        });
    }

    if(!areas||areas.length===0){
        areaSelect.innerHTML='<option value="">Nenhuma área disponível</option>';
    }else{
        areaSelect.innerHTML='<option value="">Selecione a área</option>';
        areas.forEach(a=>{
            areaSelect.innerHTML+=`<option value="${a.nome}">${a.nome}</option>`;
        });
    }
}

function formatarCronometro(diffMs){
    const diff=Math.max(0,diffMs);

    const hrs=Math.floor(diff/3600000)
        .toString()
        .padStart(2,'0');

    const mins=Math.floor((diff%3600000)/60000)
        .toString()
        .padStart(2,'0');

    const secs=Math.floor((diff%60000)/1000)
        .toString()
        .padStart(2,'0');

    return `${hrs}:${mins}:${secs}`;
}

function formatarDuracaoMs(diffMs){
    const totalSegundos=Math.max(
        0,
        Math.round(diffMs/1000)
    );

    const totalMinutos=Math.round(diffMs/60000);

    if(totalMinutos<1){
        return `${totalSegundos} segundos`;
    }

    if(totalMinutos<60){
        return `${totalMinutos} min`;
    }

    return `${Math.floor(totalMinutos/60)}h e ${totalMinutos%60}min`;
}

function calcularTempoProdutivoMs(agora=new Date()){
    if(!currentSession){
        return 0;
    }

    const inicio=new Date(currentSession.startTime);

    let pausaAtualMs=0;

    if(
        currentSession.isPaused &&
        currentSession.pauseStartedAt
    ){
        pausaAtualMs=Math.max(
            0,
            agora-new Date(currentSession.pauseStartedAt)
        );
    }

    const totalPausadoMs=
        (currentSession.totalPausedMs||0)+pausaAtualMs;

    return Math.max(
        0,
        agora-inicio-totalPausadoMs
    );
}

function updateStatusUI(isRunning,isPaused=false){
    const container=document.getElementById('status-container');
    const timerEl=document.getElementById('live-timer');

    if(isRunning && isPaused){
        container.innerHTML=
            '<span class="status-badge status-running">ATIVIDADE PAUSADA</span>';

        timerEl.style.display='block';
        return;
    }

    if(isRunning){
        container.innerHTML=
            '<span class="status-badge status-running">Atividade em andamento...</span>';

        timerEl.style.display='block';
        return;
    }

    container.innerHTML=
        '<span class="status-badge status-free">Pronto para iniciar</span>';

    timerEl.style.display='none';
    timerEl.innerText='00:00:00';
}

function startLiveTimerUpdate(){
    const timerEl=document.getElementById('live-timer');

    clearInterval(timerInterval);

    function update(){
        if(!currentSession){
            return;
        }

        const tempoProdutivoMs=
            calcularTempoProdutivoMs(new Date());

        timerEl.innerText=
            formatarCronometro(tempoProdutivoMs);
    }

    update();

    timerInterval=setInterval(update,1000);
}

function finalizarPausaAtual(endTime=new Date()){
    if(
        !currentSession ||
        !currentSession.isPaused ||
        !currentSession.pauseStartedAt
    ){
        return 0;
    }

    const inicioPausa=
        new Date(currentSession.pauseStartedAt);

    const duracaoPausaMs=Math.max(
        0,
        endTime-inicioPausa
    );

    currentSession.totalPausedMs=
        (currentSession.totalPausedMs||0)+duracaoPausaMs;

    if(!Array.isArray(currentSession.pausas)){
        currentSession.pausas=[];
    }

    for(
        let indice=currentSession.pausas.length-1;
        indice>=0;
        indice--
    ){
        const pausa=currentSession.pausas[indice];

        if(!pausa.fim){
            pausa.fim=endTime.toISOString();
            pausa.duracao_segundos=
                Math.round(duracaoPausaMs/1000);

            break;
        }
    }

    currentSession.isPaused=false;
    currentSession.pauseStartedAt=null;

    return duracaoPausaMs;
}

function abrirModalPausa(){
    const modal=document.getElementById('pause-modal');
    const motivo=document.getElementById('pause-reason');
    const outro=document.getElementById('pause-other-reason');
    const grupoOutro=document.getElementById('pause-other-group');

    motivo.value='';
    outro.value='';
    grupoOutro.style.display='none';

    modal.style.display='flex';
    modal.setAttribute('aria-hidden','false');

    setTimeout(()=>{
        motivo.focus();
    },50);
}

function fecharModalPausa(){
    const modal=document.getElementById('pause-modal');

    modal.style.display='none';
    modal.setAttribute('aria-hidden','true');
}

function alternarCampoOutroMotivo(){
    const motivo=document.getElementById('pause-reason').value;
    const grupoOutro=document.getElementById('pause-other-group');
    const outro=document.getElementById('pause-other-reason');

    if(motivo==='Outro'){
        grupoOutro.style.display='block';

        setTimeout(()=>{
            outro.focus();
        },50);

        return;
    }

    grupoOutro.style.display='none';
    outro.value='';
}

function confirmarPausaTracking(){
    if(!currentSession){
        fecharModalPausa();
        Toast.warning('Não existe atividade em andamento.');
        return;
    }

    if(currentSession.isPaused){
        fecharModalPausa();
        return;
    }

    const motivoSelecionado=
        document.getElementById('pause-reason').value;

    const outroMotivo=
        document
            .getElementById('pause-other-reason')
            .value
            .trim();

    if(!motivoSelecionado){
        Toast.warning('Selecione o motivo da pausa.');
        return;
    }

    if(
        motivoSelecionado==='Outro' &&
        !outroMotivo
    ){
        Toast.warning('Informe o motivo da pausa.');
        return;
    }

    const motivoFinal=
        motivoSelecionado==='Outro'
            ? outroMotivo
            : motivoSelecionado;

    const agora=new Date();

    currentSession.isPaused=true;
    currentSession.pauseStartedAt=agora.toISOString();

    if(!Array.isArray(currentSession.pausas)){
        currentSession.pausas=[];
    }

    currentSession.pausas.push({
        motivo:motivoFinal,
        inicio:agora.toISOString(),
        fim:null,
        duracao_segundos:null
    });

    document.getElementById('btn-pause').innerText='RETOMAR';

    fecharModalPausa();
    updateStatusUI(true,true);

    Toast.warning(
        `Atividade pausada. Motivo: ${motivoFinal}.`
    );
}

function togglePauseTracking(){
    if(!currentSession){
        Toast.warning('Não existe atividade em andamento.');
        return;
    }

    const btnPause=document.getElementById('btn-pause');

    if(!currentSession.isPaused){
        abrirModalPausa();
        return;
    }

    finalizarPausaAtual(new Date());

    btnPause.innerText='PAUSAR';

    updateStatusUI(true,false);

    Toast.success('Atividade retomada.');
}

function alternarQuantidadeEsperada(){
    const temQuantidadeEsperada=document.getElementById('tem-quantidade-esperada').value;
    const grupoQuantidadeEsperada=document.getElementById('grupo-quantidade-esperada');
    const campoQuantidadeEsperada=document.getElementById('quantidade-esperada');

    if(temQuantidadeEsperada==='sim'){
        grupoQuantidadeEsperada.style.display='block';
        campoQuantidadeEsperada.disabled=false;
    }else{
        grupoQuantidadeEsperada.style.display='none';
        campoQuantidadeEsperada.value='';
        campoQuantidadeEsperada.disabled=true;
    }
}

function startTracking(){
    const user=usuarioLogado.nome+' ('+usuarioLogado.usuario+')';
    const depositor=document.getElementById('depositor-name').value;
    const name=document.getElementById('activity-name').value;
    const area=document.getElementById('area-name').value;
    const lote=document.getElementById('lote').value.trim();
    const temQuantidadeEsperada=document.getElementById('tem-quantidade-esperada').value;
    let quantidadeEsperada=null;
    const unidade=document.getElementById('unidade').value.trim()||'peça';
    const startTime=new Date();

    if(temQuantidadeEsperada==='sim'){
        quantidadeEsperada=Number(document.getElementById('quantidade-esperada').value||0);

        if(quantidadeEsperada<=0){
            Toast.warning('Informe a quantidade esperada ou selecione "Não".');
            return;
        }
    }

    if(!user||!depositor||!name||!area||!lote){
        Toast.warning('Preencha depositante, serviço, área e lote.');
        return;
    }

    currentSession={
        user,
        depositor,
        name,
        area,
        lote,
        temQuantidadeEsperada,
        quantidadeEsperada,
        unidade,
        startTime:startTime.toISOString(),
        isPaused:false,
        pauseStartedAt:null,
        totalPausedMs:0,
        pausas:[]
    };

    document.getElementById('depositor-name').disabled=true;
    document.getElementById('activity-name').disabled=true;
    document.getElementById('area-name').disabled=true;
    document.getElementById('lote').disabled=true;
    document.getElementById('tem-quantidade-esperada').disabled=true;
    document.getElementById('quantidade-esperada').disabled=true;
    document.getElementById('unidade').disabled=true;

    document.getElementById('grupo-quantidade-realizada').style.display='block';
    document.getElementById('grupo-observacao').style.display='block';

    document.getElementById('quantidade-realizada').disabled=false;
    document.getElementById('observacao').disabled=false;

    document.getElementById('btn-start').disabled=true;
    document.getElementById('btn-end').disabled=false;
    document.getElementById('btn-pause').disabled=false;
    document.getElementById('btn-pause').innerText='PAUSAR';

    startLiveTimerUpdate();
    updateStatusUI(true,false);
}

async function stopTracking(){
    if(!currentSession)return;

    const quantidadeRealizada=Number(document.getElementById('quantidade-realizada').value||0);
    const observacao=document.getElementById('observacao').value.trim();

    let diferencaQuantidade=null;

    if(currentSession.temQuantidadeEsperada==='sim'){
        diferencaQuantidade=quantidadeRealizada-currentSession.quantidadeEsperada;
    }

    if(quantidadeRealizada<=0){
        Toast.warning('Informe a quantidade realizada antes de finalizar.');
        return;
    }

    const endTime=new Date();

    if(currentSession.isPaused){
        finalizarPausaAtual(endTime);
    }

    clearInterval(timerInterval);

    const startTime=new Date(currentSession.startTime);
    const totalPausedMs=currentSession.totalPausedMs||0;

    const diffMs=Math.max(
        0,
        endTime-startTime-totalPausedMs
    );

    const diffSegundos=Math.round(diffMs/1000);
    const horas=diffMs/3600000;

    const durationText=formatarDuracaoMs(diffMs);
    const pauseDurationText=
        formatarDuracaoMs(totalPausedMs);

    const produtividadeHora=horas>0 ? Number((quantidadeRealizada/horas).toFixed(2)) : 0;
    const metaHora=0;
    const atingiuMeta=false;

    const idLocal =
        crypto.randomUUID ?
        crypto.randomUUID() :
        `local_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    const tempoTotalSegundos=Math.max(
        0,
        Math.round((endTime-startTime)/1000)
    );

    const tempoPausadoSegundos=Math.max(
        0,
        Math.round(totalPausedMs/1000)
    );

    const pausas=Array.isArray(currentSession.pausas)
        ? currentSession.pausas
        : [];

    const dadosAtividade={
        id_local:idLocal,
        usuario:currentSession.user,
        depositante:currentSession.depositor,
        atividade:currentSession.name,
        area:currentSession.area,
        lote:currentSession.lote,
        quantidade_esperada:currentSession.quantidadeEsperada,
        quantidade_realizada:quantidadeRealizada,
        diferenca_quantidade:diferencaQuantidade,
        quantidade:quantidadeRealizada,
        unidade:currentSession.unidade,
        produtividade_hora:produtividadeHora,
        observacao:observacao,
        meta_hora:metaHora,
        atingiu_meta:atingiuMeta,
        inicio:startTime.toISOString(),
        fim:endTime.toISOString(),
        duracao:durationText,
        duracao_segundos:diffSegundos,
        tempo_total_segundos:tempoTotalSegundos,
        tempo_pausado_segundos:tempoPausadoSegundos,
        pausas
    };

    let salvoOffline=false;

    try{
        const resultado=await apiPost('/api/atividades',dadosAtividade);
        console.log('RESPOSTA SALVAR ATIVIDADE:', resultado);
    }catch(erro){
        console.error(erro);
        await salvarOffline(dadosAtividade);
        salvoOffline=true;
    }

    let mensagemFinal=`✅ Contagem concluída!\n\n⏱️ Tempo produtivo: ${durationText}\n⏸️ Tempo pausado: ${pauseDurationText}\n✅ Realizado: ${quantidadeRealizada}`;

    if(currentSession.temQuantidadeEsperada==='sim'){
        mensagemFinal+=`\n📦 Esperado: ${currentSession.quantidadeEsperada}`;
        mensagemFinal+=`\n🔁 Diferença: ${diferencaQuantidade}`;
    }

    mensagemFinal+=`\n📊 Produtividade: ${produtividadeHora} por hora`;

    if(salvoOffline){
        mensagemFinal+=`\n\n⚠️ Sem conexão com a API. Atividade salva localmente e será sincronizada automaticamente.`;
    }
    
    await atualizarIndicadorOffline();
    Toast.success(mensagemFinal);

    currentSession=null;

    document.getElementById('depositor-name').disabled=false;
    document.getElementById('activity-name').disabled=false;
    document.getElementById('area-name').disabled=false;
    document.getElementById('lote').disabled=false;
    document.getElementById('tem-quantidade-esperada').disabled=false;
    document.getElementById('quantidade-esperada').disabled=false;
    document.getElementById('quantidade-realizada').disabled=false;
    document.getElementById('unidade').disabled=false;
    document.getElementById('observacao').disabled=false;

    document.getElementById('btn-start').disabled=false;
    document.getElementById('btn-end').disabled=true;

    document.getElementById('grupo-quantidade-realizada').style.display='none';
    document.getElementById('grupo-observacao').style.display='none';

    document.getElementById('lote').value='';
    document.getElementById('tem-quantidade-esperada').value='sim';
    document.getElementById('quantidade-esperada').value='';
    document.getElementById('quantidade-realizada').value='';
    document.getElementById('observacao').value='';
    document.getElementById('unidade').value='peça';

    alternarQuantidadeEsperada();
    updateStatusUI(false);
}
