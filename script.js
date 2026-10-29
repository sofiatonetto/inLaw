/* =========================================================
   InLaw · script do site
   Tudo o que você normalmente edita está nesta primeira parte.
   ========================================================= */

// GitHub: de onde o site lê as fotos da galeria e os posts do blog
const GITHUB_USUARIO = "SEU-USUARIO";
const GITHUB_REPO    = "SEU-REPOSITORIO";
const BRANCH         = "main";
const PASTA_FOTOS    = "";      // "" = fotos soltas na raiz do repositório
const PASTA_BLOG     = "blog";

// Membros ativos (um nome por item)
const MEMBROS = [
  "Nome do Membro",
  "Outro Membro",
  "Mais um Membro",
];

// Encontros (aparecem só na Área do professor): data (ano-mês-dia) e, se quiser, o tema.
// Para cada novo encontro, copie uma linha e troque a data.
const ENCONTROS = [
  { data: "2026-11-09", tema: "" },
];

// Senha da área do professor (padrão: inlaw2026).
// Para trocar: abra o site, aperte F12 > Console, digite gerarHash("nova-senha")
// e cole aqui o código que aparecer.
const HASH_SENHA = "2728e8ede69eded5f5930e935f6fec08617d9659772642ecd39d2554d62dbfed";

// Chamada por QR code: cole aqui o link do "App da Web" da Planilha Google
// (passo a passo no arquivo LEIA-ME-chamada.txt). Vazio = chamada só neste aparelho.
const URL_PLANILHA = "https://script.google.com/macros/s/AKfycbxiuVbWyOS2jt0B9xTC-FlqVvO0IG-48Gz2-DeEPaQWU9HBi5DP4goZdwkyrHka0SlhKA/exec";
/* =========================================================
   InLaw · Chamada pela Planilha Google
   Cole este código em Extensões > Apps Script da planilha.
   ========================================================= */

const SENHA = "inlaw2026";          // mesma senha da área do professor no site
const FUSO  = "America/Sao_Paulo";
const ABA   = "Presenças";

// Aba onde as presenças ficam (é criada sozinha na primeira presença)
function aba() {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  let a = planilha.getSheetByName(ABA);
  if (!a) {
    a = planilha.insertSheet(ABA);
    a.appendRow(["Data do encontro", "Nome", "Horário da resposta"]);
    a.setFrozenRows(1);
    a.getRange("1:1").setFontWeight("bold");
  }
  return a;
}

const resposta  = obj => ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
const dataBR    = iso => iso.split("-").reverse().join("/");          // 2026-11-09 -> 09/11/2026
const hojeISO   = () => Utilities.formatDate(new Date(), FUSO, "yyyy-MM-dd");
// "Ána  SOUZA" -> "ana souza": não deixa a mesma pessoa contar duas vezes
const mesmoNome = n => String(n).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();

// Presenças de um encontro
function presentes(data) {
  return aba().getDataRange().getDisplayValues().slice(1)
    .map((l, i) => ({ linha: i + 2, data: l[0], nome: l[1], hora: l[2] }))
    .filter(p => p.data === dataBR(data));
}

// Lista para o professor (pede senha)
function doGet(e) {
  const p = e.parameter;
  if (p.senha !== SENHA) return resposta({ ok: false, erro: "Senha incorreta." });
  return resposta({ ok: true, presentes: presentes(p.data).map(({ nome, hora }) => ({ nome, hora })) });
}

// Registrar presença (aluno) ou remover (professor)
function doPost(e) {
  const p = JSON.parse(e.postData.contents);
  const trava = LockService.getScriptLock();
  trava.waitLock(10000);
  try {
    if (p.acao === "remover") {
      if (p.senha !== SENHA) return resposta({ ok: false, erro: "Senha incorreta." });
      const alvo = presentes(p.data).find(x => mesmoNome(x.nome) === mesmoNome(p.nome));
      if (alvo) aba().deleteRow(alvo.linha);
      return resposta({ ok: true });
    }

    const nome = String(p.nome || "").trim().replace(/\s+/g, " ");
    if (!nome) return resposta({ ok: false, erro: "Preencha seu nome." });

    // alunos só conseguem responder no dia do encontro (o professor pode lançar em qualquer dia)
    if (p.senha !== SENHA && p.data !== hojeISO())
      return resposta({ ok: false, erro: "A chamada deste encontro não está aberta hoje." });

    if (presentes(p.data).some(x => mesmoNome(x.nome) === mesmoNome(nome)))
      return resposta({ ok: false, erro: `${nome} já está na chamada deste encontro.` });

    const hora = Utilities.formatDate(new Date(), FUSO, "HH:mm:ss");
    // o apóstrofo guarda como texto, para a planilha não mudar o formato da data e da hora
    aba().appendRow(["'" + dataBR(p.data), nome, "'" + hora]);
    return resposta({ ok: true, hora });
  } finally {
    trava.releaseLock();
  }
}
