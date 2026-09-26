// =======================================
// GOOGLE APPS SCRIPT - ATIVIDADE QUÍMICA
// 3ª Série F - 3º Bimestre
// =======================================
// Cole este código no Apps Script vinculado à planilha de respostas.
// Publique como Web App: executar como você; acesso: qualquer pessoa.

const SHEET_ID = '1DNRtzsGS4CCF5N4DN4Ma6uitO6tHmgQreoJ7wYrxlBE';
const SHEET_NAME = 'Respostas';
const GABARITO = { Q1: 'C', Q2: 'D', Q3: 'B', Q4: 'D', Q5: 'C', Q6: 'E', Q7: 'A' };
const CABECALHO = [
  'Timestamp', 'Turma', 'Nome', 'RA', 'Email',
  'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7',
  'Resposta Q8 (Dissertativa)', 'Resposta Q9 (Dissertativa)',
  'Resposta Q10 (Dissertativa)', 'Acertos (Objetivas)',
  'Q1 Correto?', 'Q2 Correto?', 'Q3 Correto?', 'Q4 Correto?',
  'Q5 Correto?', 'Q6 Correto?', 'Q7 Correto?'
];

function respostaJson_(payload, statusCode) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return respostaJson_({ status: 'sucesso', mensagem: 'Web App da avaliação da 3ª Série F ativo.' });
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('Nenhum conteúdo JSON foi recebido.');
    }
    const dados = JSON.parse(e.postData.contents);
    validarDados_(dados);
    const resultado = gravarNaPlanilha_(dados);
    return respostaJson_({ status: 'sucesso', mensagem: 'Respostas gravadas com sucesso!', resultado: resultado });
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
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, CABECALHO.length).setValues([CABECALHO]);
    sheet.setFrozenRows(1);
    const header = sheet.getRange(1, 1, 1, CABECALHO.length);
    header.setBackground('#1e3c72').setFontColor('#ffffff').setFontWeight('bold');
  }
}

function gravarNaPlanilha_(dados) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const sheet = obterPlanilha_();
    garantirCabecalho_(sheet);
    const respostas = [];
    for (let i = 1; i <= 7; i++) respostas.push(String(dados['Q' + i] || '').toUpperCase());
    const acertos = respostas.reduce((total, resposta, index) => total + (resposta === GABARITO['Q' + (index + 1)] ? 1 : 0), 0);
    const linha = [
      new Date(), dados.turma || '', dados.nome || '', dados.ra || '', dados.email || '',
      ...respostas, dados.Q8 || '', dados.Q9 || '', dados.Q10 || '', acertos,
      ...respostas.map((resposta, index) => verificarResposta_(resposta, 'Q' + (index + 1)))
    ];
    sheet.getRange(sheet.getLastRow() + 1, 1, 1, linha.length).setValues([linha]);
    const numeroLinha = sheet.getLastRow();
    aplicarFormatacao_(sheet, numeroLinha, acertos, respostas);
    return { linha: numeroLinha, acertos: acertos };
  } finally {
    lock.releaseLock();
  }
}

function verificarResposta_(resposta, questao) {
  if (!resposta) return 'Não respondida';
  return resposta === GABARITO[questao] ? 'CORRETA' : 'INCORRETA';
}

function aplicarFormatacao_(sheet, linha, acertos, respostas) {
  respostas.forEach(function(resposta, index) {
    const cell = sheet.getRange(linha, 6 + index);
    if (!resposta) return;
    cell.setBackground(resposta === GABARITO['Q' + (index + 1)] ? '#4caf50' : '#f44336')
      .setFontColor('#ffffff').setFontWeight('bold');
    const status = sheet.getRange(linha, 17 + index);
    status.setBackground(resposta === GABARITO['Q' + (index + 1)] ? '#4caf50' : '#f44336')
      .setFontColor('#ffffff').setFontWeight('bold');
  });
  const nota = sheet.getRange(linha, 16);
  nota.setBackground(acertos >= 5 ? '#4caf50' : acertos >= 3 ? '#ff9800' : '#f44336')
    .setFontColor('#ffffff').setFontWeight('bold');
}

// Implantação: Apps Script > Implantar > Nova implantação > Aplicativo da Web.
// Cole a URL gerada em googleSheetURL no arquivo avaliacao.html.
