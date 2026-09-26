// =========================================================================
// GOOGLE APPS SCRIPT - AVALIAÇÃO DE QUÍMICA (3ª Série F - 3º Bimestre)
// Cinética Química - Objetivas (Q1-Q7) + Dissertativas corrigidas por IA (Q8-Q10)
// =========================================================================
// Cole este código no Apps Script vinculado à planilha de respostas.
// Publique como Web App: executar como você; acesso: qualquer pessoa.
// PRIMEIRO PASSO OBRIGATÓRIO: rode a função CONFIGURAR_CHAVE_GEMINI() uma
// única vez (edite a chave dentro dela) para gravar a chave com segurança.
// Depois disso você pode apagar a chave de dentro da função, ela já fica
// salva nas "Propriedades do script" (não aparece mais no código-fonte).

const SHEET_ID = '1DNRtzsGS4CCF5N4DN4Ma6uitO6tHmgQreoJ7wYrxlBE';
const SHEET_NAME = 'Respostas';
const GABARITO = { Q1: 'C', Q2: 'D', Q3: 'B', Q4: 'D', Q5: 'C', Q6: 'E', Q7: 'A' };

const CABECALHO = [
  'Timestamp', 'Turma', 'Nome', 'RA', 'Email',
  'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7',
  'Resposta Q8 (Dissertativa)', 'Resposta Q9 (Dissertativa)', 'Resposta Q10 (Dissertativa)',
  'Nota Objetivas (0-7)',
  'Q1 Correto?', 'Q2 Correto?', 'Q3 Correto?', 'Q4 Correto?', 'Q5 Correto?', 'Q6 Correto?', 'Q7 Correto?',
  'Nota Q8 (IA)', 'Nota Q9 (IA)', 'Nota Q10 (IA)',
  'Nota Final (0-10)', 'Status da Correção',
  'Critério Q8 (IA)', 'Critério Q9 (IA)', 'Critério Q10 (IA)'
];

// ========== BANDAS DE CRITÉRIO POR QUESTÃO (mesma rubrica usada no prompt da IA) ==========
// Cada lista fica em ordem decrescente de nota; a primeira banda com nota >= min é usada.
const CRITERIOS_Q8 = [
  { min: 1.0, label: 'Completo (1,0)', cor: '#4caf50', corClara: '#e8f5e9', texto: 'Resposta completa, cita concentração e colisões efetivas, explica o mecanismo molecular.' },
  { min: 0.7, label: 'Adequado (0,7–0,9)', cor: '#8bc34a', corClara: '#f1f8e9', texto: 'Identifica dois fatores mas falta contexto molecular (colisões, energia de ativação).' },
  { min: 0.4, label: 'Parcial (0,4–0,6)', cor: '#ff9800', corClara: '#fff3e0', texto: 'Responde parcialmente, menciona apenas um fator ou explicação incompleta.' },
  { min: 0.0, label: 'Insuficiente (0,0–0,3)', cor: '#f44336', corClara: '#ffebee', texto: 'Não responde ou resposta irrelevante.' }
];
const CRITERIOS_Q9 = [
  { min: 1.0, label: 'Completo (1,0)', cor: '#4caf50', corClara: '#e8f5e9', texto: 'Relaciona os três fatores (temperatura, área de superfície, pressão) com cinética e indica o mais significativo.' },
  { min: 0.7, label: 'Adequado (0,7–0,9)', cor: '#8bc34a', corClara: '#f1f8e9', texto: 'Explica os três fatores mas não indica qual é o mais significativo.' },
  { min: 0.4, label: 'Parcial (0,4–0,6)', cor: '#ff9800', corClara: '#fff3e0', texto: 'Identifica dois fatores corretamente, falta profundidade.' },
  { min: 0.0, label: 'Insuficiente (0,0–0,3)', cor: '#f44336', corClara: '#ffebee', texto: 'Menciona apenas um fator ou sem conexão clara.' }
];
const CRITERIOS_Q10 = [
  { min: 1.0, label: 'Completo (1,0)', cor: '#4caf50', corClara: '#e8f5e9', texto: 'Propõe 3+ ações justificadas com conceitos corretos de cinética, integrando segurança e economia.' },
  { min: 0.7, label: 'Adequado (0,7–0,9)', cor: '#8bc34a', corClara: '#f1f8e9', texto: 'Propõe 3 ações com justificativas adequadas, falta profundidade na análise.' },
  { min: 0.4, label: 'Parcial (0,4–0,6)', cor: '#ff9800', corClara: '#fff3e0', texto: 'Propõe 1-2 ações com justificativa parcial.' },
  { min: 0.0, label: 'Insuficiente (0,0–0,3)', cor: '#f44336', corClara: '#ffebee', texto: 'Ações genéricas sem justificativa ou com conceitos errados.' }
];

function obterCriterio_(criterios, nota) {
  const n = Number(nota);
  for (const c of criterios) {
    if (n >= c.min) return c;
  }
  return criterios[criterios.length - 1];
}

// Monta o texto que vai DENTRO da célula "Critério Qx (IA)": banda da rubrica + feedback pontual da IA.
function formatarCriterioCelula_(criterios, nota, obsIA) {
  const c = obterCriterio_(criterios, nota);
  return `${c.label}\n${c.texto}${obsIA ? '\nIA: ' + obsIA : ''}`;
}

// ========== CONFIGURAÇÃO DA CHAVE (RODAR UMA VEZ) ==========
function CONFIGURAR_CHAVE_GEMINI() {
  const CHAVE = 'COLE_AQUI_SUA_CHAVE_GEMINI'; // <-- cole a chave só nesta linha, uma vez, e depois pode apagar
  PropertiesService.getScriptProperties().setProperty('GEMINI_API_KEY', CHAVE);
  Logger.log('Chave gravada com sucesso nas Propriedades do Script.');
}

function getGeminiKey_() {
  const key = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!key) throw new Error('GEMINI_API_KEY não configurada. Rode CONFIGURAR_CHAVE_GEMINI() primeiro.');
  return key;
}

// ========== ENDPOINTS ==========
function respostaJson_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return respostaJson_({ status: 'sucesso', mensagem: 'Web App da avaliação de Química (3ª Série F) ativo.' });
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('Nenhum conteúdo JSON foi recebido.');
    }
    const dados = JSON.parse(e.postData.contents);
    validarDados_(dados);
    const resultado = gravarNaPlanilha_(dados);
    return respostaJson_({
      status: 'sucesso',
      mensagem: resultado.mensagem,
      acertos: resultado.acertos,
      notaFinal: resultado.notaFinal
    });
  } catch (erro) {
    console.error(erro);
    return respostaJson_({ status: 'erro', mensagem: erro.message || String(erro) });
  }
}

function validarDados_(dados) {
  if (!dados.turma || !dados.nome || dados.turma !== '3ª Série F') {
    throw new Error('Turma ou nome do aluno inválido.');
  }
}

function obterPlanilha_() {
  const pasta = SpreadsheetApp.openById(SHEET_ID);
  return pasta.getSheetByName(SHEET_NAME) || pasta.insertSheet(SHEET_NAME);
}

function garantirCabecalho_(sheet) {
  // Migra uma aba antiga sem apagar respostas já registradas: acrescenta apenas
  // os cabeçalhos que ainda não existem e mantém a ordem das colunas existentes.
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, CABECALHO.length).setValues([CABECALHO]);
  } else {
    const quantidadeAtual = Math.max(sheet.getLastColumn(), 1);
    const cabecalhoAtual = sheet.getRange(1, 1, 1, quantidadeAtual).getValues()[0];
    const cabecalhoMigrado = CABECALHO.map(function(nome, indice) {
      // A primeira versão usava "Acertos (Objetivas)" na coluna 16.
      // O novo nome torna explícita a escala de 0 a 7.
      if (indice === 15 && cabecalhoAtual[indice] === 'Acertos (Objetivas)') {
        return nome;
      }
      return cabecalhoAtual[indice] || nome;
    });
    const alterou = cabecalhoMigrado.some(function(nome, indice) {
      return nome !== cabecalhoAtual[indice];
    });
    if (alterou) {
      sheet.getRange(1, 1, 1, CABECALHO.length).setValues([cabecalhoMigrado]);
    }
  }
  formatarCabecalho_(sheet);
}

function formatarCabecalho_(sheet) {
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, CABECALHO.length)
    .setBackground('#1e3c72')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setWrap(true)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  sheet.setColumnWidths(13, 3, 260); // Q8-Q10 (respostas dos alunos)
  sheet.setColumnWidths(29, 3, 280); // Critério Q8-Q10 (IA)
  sheet.setRowHeight(1, 46);
}

// Rode esta função manualmente UMA VEZ se você já tem uma planilha antiga
// cujo cabeçalho ficou sem formatação (não precisa esperar uma nova resposta).
function FORMATAR_CABECALHO_AGORA() {
  formatarCabecalho_(obterPlanilha_());
  return 'Cabeçalho formatado com sucesso!';
}

// Execute uma vez após colar este código para criar as novas colunas na aba antiga.
function ATUALIZAR_ESTRUTURA_DA_PLANILHA() {
  const sheet = obterPlanilha_();
  garantirCabecalho_(sheet);
  return `Estrutura atualizada com ${CABECALHO.length} colunas.`;
}

// ========== GRAVAÇÃO PRINCIPAL ==========
function gravarNaPlanilha_(dados) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const sheet = obterPlanilha_();
    garantirCabecalho_(sheet);

    // 1. Correção das objetivas
    const respostas = [];
    for (let i = 1; i <= 7; i++) respostas.push(String(dados['Q' + i] || '').toUpperCase());
    const acertos = respostas.reduce((total, resposta, index) =>
      total + (resposta === GABARITO['Q' + (index + 1)] ? 1 : 0), 0);

    // 2. Tenta corrigir as dissertativas com IA imediatamente
    let notaQ8 = '', notaQ9 = '', notaQ10 = '';
    let obsQ8 = '', obsQ9 = '', obsQ10 = '';
    let statusCorrecao = 'Aguardando correção manual';
    let notaFinal = acertos; // provisória (0-7) até a IA corrigir

    try {
      const corrigido = gradeDissertativeWithAI_(dados.Q8, dados.Q9, dados.Q10);
      if (corrigido) {
        notaQ8 = corrigido.q8.nota;
        notaQ9 = corrigido.q9.nota;
        notaQ10 = corrigido.q10.nota;
        obsQ8 = formatarCriterioCelula_(CRITERIOS_Q8, notaQ8, corrigido.q8.obs);
        obsQ9 = formatarCriterioCelula_(CRITERIOS_Q9, notaQ9, corrigido.q9.obs);
        obsQ10 = formatarCriterioCelula_(CRITERIOS_Q10, notaQ10, corrigido.q10.obs);
        statusCorrecao = 'Corrigido por IA';
        notaFinal = Math.round((acertos + notaQ8 + notaQ9 + notaQ10) * 10) / 10;
      }
    } catch (err) {
      Logger.log('IA não conseguiu corrigir agora: ' + err.message);
    }

    const linha = [
      new Date(), dados.turma || '', dados.nome || '', dados.ra || '', dados.email || '',
      ...respostas,
      dados.Q8 || '', dados.Q9 || '', dados.Q10 || '',
      acertos,
      ...respostas.map((resposta, index) => verificarResposta_(resposta, 'Q' + (index + 1))),
      notaQ8, notaQ9, notaQ10,
      notaFinal, statusCorrecao,
      obsQ8, obsQ9, obsQ10
    ];

    sheet.getRange(sheet.getLastRow() + 1, 1, 1, linha.length).setValues([linha]);
    const numeroLinha = sheet.getLastRow();
    aplicarFormatacao_(sheet, numeroLinha, acertos, respostas);
    if (statusCorrecao === 'Corrigido por IA') {
      aplicarFormatacaoDissertativas_(sheet, numeroLinha, { q8: notaQ8, q9: notaQ9, q10: notaQ10 });
    }

    const mensagem = statusCorrecao === 'Corrigido por IA'
      ? `Respostas gravadas e corrigidas com sucesso! Nota final: ${notaFinal}/10.`
      : `Você acertou ${acertos} de 7 questões objetivas. As dissertativas serão corrigidas em breve.`;

    return { linha: numeroLinha, acertos: acertos, notaFinal: notaFinal, mensagem: mensagem };
  } finally {
    lock.releaseLock();
  }
}

function verificarResposta_(resposta, questao) {
  if (!resposta) return 'Não respondida';
  return resposta === GABARITO[questao] ? 'CORRETA' : 'INCORRETA';
}

// ========== AGENTE DE IA: CORRETOR DAS DISSERTATIVAS (GEMINI) ==========
/**
 * Corrige Q8, Q9 e Q10 com base nos critérios de avaliação específicos
 * definidos na prova de Química (Cinética Química - 3º Bimestre).
 */
function gradeDissertativeWithAI_(q8Text, q9Text, q10Text) {
  const apiKey = getGeminiKey_();
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;

  const cleanQ8 = String(q8Text || '').replace(/[\r\n]+/g, ' ').replace(/"/g, "'");
  const cleanQ9 = String(q9Text || '').replace(/[\r\n]+/g, ' ').replace(/"/g, "'");
  const cleanQ10 = String(q10Text || '').replace(/[\r\n]+/g, ' ').replace(/"/g, "'");

  const prompt = `Você é um professor especialista avaliador de Química do Ensino Médio (3ª série).
Avalie pedagogicamente as 3 respostas dissertativas dos alunos com uma nota de 0.0 a 1.0 e um feedback curto (máximo 15 palavras) para cada uma, seguindo ESTRITAMENTE os critérios abaixo.

TEMA GERAL: Cinética Química - fatores que influenciam a rapidez das transformações químicas (temperatura, concentração, superfície de contato, catalisadores/enzimas).

QUESTÃO 8 - Reconhecimento/Explicação (1,0 ponto)
Contexto: fósforo queimando ao ar livre vs. em tubo de oxigênio puro (O₂), queima muito mais intensa no segundo caso.
Pede-se: explicar por que a mudança de concentração do comburente (oxigênio) muda tanto a rapidez da combustão, citando pelo menos dois fatores.
Rubrica:
- 0,0-0,3: não responde ou resposta irrelevante.
- 0,4-0,6: responde parcialmente, menciona apenas um fator ou explicação incompleta.
- 0,7-0,9: identifica dois fatores mas falta contexto molecular (colisões, energia de ativação).
- 1,0: resposta completa, cita concentração e colisões efetivas, explica o mecanismo molecular.

QUESTÃO 9 - Aplicação/Comparação (1,0 ponto)
Contexto: três práticas de cozinha (água mais quente; alimentos cortados em pedaços pequenos; panela tampada) que aceleram o cozimento.
Pede-se: relacionar cada prática a um fator de cinética química (temperatura, área de superfície, pressão) e indicar qual tem o efeito mais significativo.
Rubrica:
- 0,0-0,3: menciona apenas um fator ou sem conexão clara.
- 0,4-0,6: identifica dois fatores corretamente, falta profundidade.
- 0,7-0,9: explica os três fatores mas não indica qual é mais significativo.
- 1,0: relaciona corretamente os três fatores (temperatura, área de superfície, pressão) com cinética e indica temperatura/pressão como mais significativa.

QUESTÃO 10 - Análise/Justificação (1,0 ponto)
Contexto: fábrica de medicamentos com reação exotérmica; rápida demais danifica o produto/explode o reator, lenta demais é inviável economicamente.
Pede-se: propor pelo menos 3 ações para manter a reação em velocidade ótima e segura, justificando cada uma com conceitos de cinética.
Rubrica:
- 0,0-0,3: ações genéricas sem justificativa ou com conceitos errados.
- 0,4-0,6: 1-2 ações com justificativa parcial.
- 0,7-0,9: 3 ações com justificativas adequadas, falta profundidade.
- 1,0: 3+ ações (ex.: resfriamento/controle de temperatura, catalisador, concentração controlada), cada uma justificada com conceitos corretos de cinética, integrando segurança e economia.

RESPOSTAS DO ALUNO:
- Q8: "${cleanQ8}"
- Q9: "${cleanQ9}"
- Q10: "${cleanQ10}"

Responda ESTRITAMENTE em formato JSON (sem markdown, sem backticks):
{
  "q8": { "nota": 1.0, "obs": "Feedback máximo 15 palavras" },
  "q9": { "nota": 1.0, "obs": "Feedback máximo 15 palavras" },
  "q10": { "nota": 1.0, "obs": "Feedback máximo 15 palavras" }
}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: 'application/json', temperature: 0.2 }
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(endpoint, options);
  if (response.getResponseCode() !== 200) {
    Logger.log('Erro na chamada Gemini: ' + response.getContentText());
    return null;
  }

  const json = JSON.parse(response.getContentText());
  const rawText = json.candidates[0].content.parts[0].text;
  const cleanJsonText = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
  const result = JSON.parse(cleanJsonText);

  return {
    q8: { nota: Math.min(1, Math.max(0, Number(result.q8?.nota || 0))), obs: String(result.q8?.obs || '').trim() },
    q9: { nota: Math.min(1, Math.max(0, Number(result.q9?.nota || 0))), obs: String(result.q9?.obs || '').trim() },
    q10: { nota: Math.min(1, Math.max(0, Number(result.q10?.nota || 0))), obs: String(result.q10?.obs || '').trim() }
  };
}

// ========== CORRIGIR EM LOTE AS PENDENTES ==========
// Use pelo menu (ou rode manualmente) para corrigir linhas que ficaram
// como "Aguardando correção manual" (ex.: se a API falhou no envio original).
function CORRIGIR_DISSERTATIVAS_AGORA() {
  const sheet = obterPlanilha_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return 'Nenhuma resposta para corrigir.';

  const dados = sheet.getRange(2, 1, lastRow - 1, CABECALHO.length).getValues();
  let total = 0;

  for (let i = 0; i < dados.length; i++) {
    const linha = i + 2;
    const status = String(dados[i][27] || ''); // col 28: Status da Correção
    if (!status.toLowerCase().includes('aguardando')) continue;

    const q8 = dados[i][12], q9 = dados[i][13], q10 = dados[i][14]; // cols 13,14,15
    const acertos = Number(dados[i][15] || 0); // col 16: Nota Objetivas

    try {
      const corrigido = gradeDissertativeWithAI_(q8, q9, q10);
      if (corrigido) {
        const notaFinal = Math.round((acertos + corrigido.q8.nota + corrigido.q9.nota + corrigido.q10.nota) * 10) / 10;
        const criterioQ8 = formatarCriterioCelula_(CRITERIOS_Q8, corrigido.q8.nota, corrigido.q8.obs);
        const criterioQ9 = formatarCriterioCelula_(CRITERIOS_Q9, corrigido.q9.nota, corrigido.q9.obs);
        const criterioQ10 = formatarCriterioCelula_(CRITERIOS_Q10, corrigido.q10.nota, corrigido.q10.obs);

        sheet.getRange(linha, 24).setValue(corrigido.q8.nota);
        sheet.getRange(linha, 25).setValue(corrigido.q9.nota);
        sheet.getRange(linha, 26).setValue(corrigido.q10.nota);
        sheet.getRange(linha, 27).setValue(notaFinal);
        sheet.getRange(linha, 28).setValue('Corrigido por IA');
        sheet.getRange(linha, 29).setValue(criterioQ8);
        sheet.getRange(linha, 30).setValue(criterioQ9);
        sheet.getRange(linha, 31).setValue(criterioQ10);

        aplicarFormatacaoDissertativas_(sheet, linha, { q8: corrigido.q8.nota, q9: corrigido.q9.nota, q10: corrigido.q10.nota });
        total++;
      }
    } catch (err) {
      Logger.log('Erro na linha ' + linha + ': ' + err.message);
    }
  }

  const msg = `${total} atividade(s) corrigida(s) com sucesso pela IA!`;
  try { SpreadsheetApp.getActiveSpreadsheet().toast(msg, 'Correção Concluída', 5); } catch (e) { Logger.log(msg); }
  return msg;
}

// ========== FORMATAÇÃO ==========
function aplicarFormatacao_(sheet, linha, acertos, respostas) {
  respostas.forEach(function(resposta, index) {
    const cell = sheet.getRange(linha, 6 + index);
    if (!resposta) return;
    const acertou = resposta === GABARITO['Q' + (index + 1)];
    cell.setBackground(acertou ? '#4caf50' : '#f44336').setFontColor('#ffffff').setFontWeight('bold');
    const status = sheet.getRange(linha, 17 + index);
    status.setBackground(acertou ? '#4caf50' : '#f44336').setFontColor('#ffffff').setFontWeight('bold');
  });
  const notaObjetivas = sheet.getRange(linha, 16);
  notaObjetivas.setBackground(acertos >= 5 ? '#4caf50' : acertos >= 3 ? '#ff9800' : '#f44336')
    .setFontColor('#ffffff').setFontWeight('bold');
}

// Colore as notas das dissertativas (cols 24,25,26) conforme a banda da rubrica
// e deixa as células de critério (cols 29,30,31) com quebra de linha legível.
function aplicarFormatacaoDissertativas_(sheet, linha, notas) {
  const mapa = [
    { col: 24, criterios: CRITERIOS_Q8, nota: notas.q8, colCriterio: 29 },
    { col: 25, criterios: CRITERIOS_Q9, nota: notas.q9, colCriterio: 30 },
    { col: 26, criterios: CRITERIOS_Q10, nota: notas.q10, colCriterio: 31 }
  ];
  mapa.forEach(function(item) {
    if (item.nota === '' || item.nota === null || item.nota === undefined) return;
    const c = obterCriterio_(item.criterios, item.nota);
    sheet.getRange(linha, item.col)
      .setBackground(c.cor).setFontColor('#ffffff').setFontWeight('bold').setHorizontalAlignment('center');
    sheet.getRange(linha, item.colCriterio)
      .setBackground(c.corClara) // tom claro da mesma banda, para escanear rápido visualmente
      .setWrap(true).setVerticalAlignment('top');
  });
  sheet.setRowHeightsForced(linha, 1, 60);
}

// ========== MENU NA PLANILHA ==========
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Avaliação de Química')
    .addItem('🤖 Corrigir dissertativas pendentes com IA', 'CORRIGIR_DISSERTATIVAS_AGORA')
    .addItem('🎨 Formatar cabeçalho agora', 'FORMATAR_CABECALHO_AGORA')
    .addToUi();
}

// Implantação: Apps Script > Implantar > Nova implantação > Aplicativo da Web.
// Cole a URL gerada em googleSheetURL no arquivo avaliacao.html.