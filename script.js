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
const URL_PLANILHA = "";

// Fotos usadas na galeria se o site não conseguir ler o GitHub
const FOTOS_PADRAO = [
  "ii-inlaw-experience.jpg",
  "encontro-do-grupo.jpg",
  "manual-ia-generativa.jpg",
  "escola-padre-rafael-iop.jpg",
  "educar-para-transformar.jpg",
  "visita-escola-vale-veneto.jpg",
];

// Posts do blog que já estão no site (os da pasta blog/ do GitHub aparecem junto, mais novos primeiro)
const POSTS_EXEMPLO = [
  { titulo: "Coordenador de Proteção de Dados", serie: "As Profissões do Futuro!", autor: "InLaw", data: "13/06/2023", capa: "",
    corpo: `Vamos descobrir a importância deste profissional? 🎯

O Coordenador(a) de Proteção de Dados é um profissional responsável por cuidar de questões referentes à proteção de dados da organização e de seus clientes.

Possui uma área de influência muito relevante, passando por todo o ciclo do tratamento dos dados, desde a atividade preventiva, passando pela fase de orientação e monitoramento, até chegar na conclusão.

Além disso, auxilia na implementação e estruturação de programas de compliance.

Dentre as suas principais atribuições estão: coordenar equipe de segurança da informação e de gerenciamento de redes, monitorar ambiente e tomar decisões estratégicas, conduzir a implementação de novas soluções tecnológicas, elaborar, implementar e revisar políticas de segurança da informação e de privacidade e proteção de dados pessoais.

Sendo assim, este profissional é fundamental para as organizações que fazem algum tipo de tratamento de dados, para que seja feita de forma correta e efetiva.

E aí, já conhecia essa profissão? Comenta lá no nosso Instagram!` },
  { titulo: "LawTechs - LegalTechs", serie: "As Profissões do Futuro!", autor: "InLaw", data: "12/06/2023", capa: "",
    corpo: `Vamos conhecer as famosas LawTechs - LegalTechs? 🔎

As LawTechs ou LegalTechs são startups que estão transformando o setor jurídico!

Além de auxiliarem nas questões burocráticas dos processos, aumentam a eficiência e melhoram a gestão de escritórios e órgãos públicos, facilitando a vida dos profissionais do Direito e, consequentemente, da população.

Com o uso da IA (Inteligência Artificial) é possível a automação de tarefas, análise de dados e resolução de problemas por meio de plataformas jurídicas, permitindo uma maior agilidade ao sistema Judiciário.

E você, já conhece ou utiliza alguma LegalTech?` },
  { titulo: "Marketing Jurídico", serie: "As Profissões do Futuro!", autor: "InLaw", data: "09/06/2023", capa: "",
    corpo: `Você sabe qual a função desse profissional? 🔎

O profissional de marketing jurídico é responsável por desenvolver e implementar estratégias de marketing para escritórios de advocacia, departamentos jurídicos ou profissionais autônomos do ramo jurídico. Seu objetivo principal é promover a marca, os serviços e a imagem do escritório ou profissional, atraindo e retendo clientes.

O marketing jurídico difere um pouco do marketing tradicional, devido às restrições éticas e regulamentações impostas pela profissão jurídica.

Além disso, o profissional de marketing jurídico também pode auxiliar na criação e gestão do relacionamento com os clientes, desenvolvendo estratégias de fidelização, acompanhamento pós-atendimento, solicitação de feedback e gerenciamento de reclamações.

E aí, já sabia dessa profissão inovadora?` },
];


/* =========================================================
   Daqui para baixo é o funcionamento do site.
   ========================================================= */

// ---------- Ajudantes ----------
const $ = id => document.getElementById(id);
const escapar = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const dataBR = iso => iso.split("-").reverse().join("/");                 // 2026-05-07 -> 07/05/2026
const nomeDoArquivo = n => n.replace(/\.\w+$/, "").replace(/[-_]/g, " ");  // encontro-do-grupo.jpg -> encontro do grupo
const urlGitHub = pasta => `https://api.github.com/repos/${GITHUB_USUARIO}/${GITHUB_REPO}/contents/${pasta}?ref=${BRANCH}`;

function lerJSON(chave, padrao) {
  try { return JSON.parse(localStorage.getItem(chave)) || padrao; } catch { return padrao; }
}
function salvarJSON(chave, valor) {
  try { localStorage.setItem(chave, JSON.stringify(valor)); } catch {}
}


// ---------- Janela (modal) ----------
const modal = $("modal");
modal.addEventListener("click", e => { if (e.target === modal) modal.close(); });

function abrir(html) {
  $("modal-conteudo").innerHTML = html;
  modal.showModal();
}


// ---------- Rodapé e membros ----------
$("ano").textContent = new Date().getFullYear();
$("membros").innerHTML = MEMBROS.map(nome => `<li>${nome}</li>`).join("");


// ---------- Menu: sublinha a seção que está na tela ----------
const linksMenu = [...document.querySelectorAll("#menu a")];
const observador = new IntersectionObserver(secoes => {
  secoes.forEach(secao => {
    if (!secao.isIntersecting) return;
    linksMenu.forEach(link => link.classList.toggle("ativo", link.getAttribute("href") === "#" + secao.target.id));
  });
}, { rootMargin: "-45% 0px -50% 0px" });

linksMenu.forEach(link => {
  const secao = document.querySelector(link.getAttribute("href"));
  if (secao) observador.observe(secao);
});


// ---------- Encontros: mini calendários ----------
function desenharCalendarios() {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const encontros = ENCONTROS
    .map(e => ({ ...e, dia: new Date(e.data + "T12:00") }))
    .sort((a, b) => a.dia - b.dia);
  const proximo = encontros.find(e => e.dia >= hoje);

  // agrupa por semestre: "2026 · 1º semestre"
  const semestres = {};
  encontros.forEach(e => {
    const nome = `${e.dia.getFullYear()} · ${e.dia.getMonth() < 6 ? 1 : 2}º semestre`;
    (semestres[nome] ||= []).push(e);
  });

  const diaDaSemana = d => d.toLocaleDateString("pt-BR", { weekday: "long" });
  const noPlural = d => diaDaSemana(d).split("-")[0] + "s";   // "segunda-feira" -> "segundas"

  const calendario = e => {
    const classe = e === proximo ? "proximo" : e.dia < hoje ? "passado" : "";
    return `
        <div class="cal ${classe}">
          <div class="mes">${e.dia.toLocaleDateString("pt-BR", { month: "long" })}</div>
          <div class="dia"><b>${e.dia.getDate()}</b><small>${diaDaSemana(e.dia)}</small></div>
          ${e.tema ? `<div class="tema">${e.tema}</div>` : ""}
          <button class="abrir-chamada" data-data="${e.data}">Chamada<small>${contarPresentes(e.data) ?? "abrir"}${contarPresentes(e.data) === null ? "" : " presentes"}</small></button>
        </div>`;
  };

  if (!encontros.length) { $("encontros").innerHTML = '<p class="vazio">Nenhum encontro cadastrado. Adicione as datas em ENCONTROS, no topo do script.js.</p>'; return; }
  $("encontros").innerHTML = Object.entries(semestres).reverse().map(([nome, lista]) => `
    <div class="semestre">
      <div class="semestre-topo"><h3>${nome}</h3><span>Encontros às ${[...new Set(lista.map(e => noPlural(e.dia)))].join(" e ")}</span></div>
      <div class="calendarios">${lista.map(calendario).join("")}</div>
    </div>`).join("");

  document.querySelectorAll(".abrir-chamada").forEach(botao => {
    botao.onclick = () => abrirChamada(botao.dataset.data);
  });
}


// ---------- Área do professor ----------
// Obs.: sem a planilha, a senha só afasta visitantes comuns. Com a planilha, a lista de
// presentes só é entregue a quem manda a senha certa.
async function sha256(texto) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
  return [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2, "0")).join("");
}
window.gerarHash = async texto => { const h = await sha256(texto); console.log(h); return h; };

const senhaProf = () => { try { return sessionStorage.getItem("inlaw-senha") || ""; } catch { return ""; } };

function modoProfessor(ligar, senha) {
  document.body.classList.toggle("prof", ligar);
  try {
    if (ligar) { sessionStorage.setItem("inlaw-prof", "1"); sessionStorage.setItem("inlaw-senha", senha); }
    else { sessionStorage.removeItem("inlaw-prof"); sessionStorage.removeItem("inlaw-senha"); }
  } catch {}
  ligar ? abrirPainel() : fecharPainel();
}

// Painel da área do professor (abre por cima do site)
function abrirPainel() {
  $("area-professor").hidden = false;
  document.body.classList.add("painel-aberto");
  desenharCalendarios();
}
function fecharPainel() {
  $("area-professor").hidden = true;
  document.body.classList.remove("painel-aberto");
}

// Ícone de pessoa na barra do topo
$("btn-prof").onclick = () => document.body.classList.contains("prof") ? abrirPainel() : pedirSenha();
$("fechar-painel").onclick = fecharPainel;
$("sair-prof").onclick = () => modoProfessor(false);
$("exportar-tudo").onclick = () => exportarPlanilha(URL_PLANILHA ? ENCONTROS.map(e => e.data) : Object.keys(lerChamadasLocais()).sort());

function pedirSenha() {
  abrir(`
    <form class="login" id="form-login">
      <h1>Área do professor</h1>
      <p>Acesso restrito à coordenação para fazer a chamada dos encontros.</p>
      <input type="password" id="senha" placeholder="Senha" autocomplete="current-password" required>
      <p class="aviso" id="erro-login" style="color:#B3261E;min-height:1.2em;margin:0 0 10px"></p>
      <button>Entrar</button>
    </form>`);
  $("senha").focus();

  $("form-login").onsubmit = async ev => {
    ev.preventDefault();
    const senha = $("senha").value;
    if (await sha256(senha) !== HASH_SENHA) {
      $("erro-login").textContent = "Senha incorreta.";
      return;
    }
    modal.close();
    modoProfessor(true, senha);
  };
}


// ---------- Onde as presenças ficam ----------
// Com URL_PLANILHA: na Planilha Google (alunos respondem pelo celular via QR code).
// Sem URL_PLANILHA: neste aparelho/navegador (exporte a planilha ao fim de cada encontro).
const CHAVE_CHAMADAS = "inlaw-chamadas";
const lerChamadasLocais = () => lerJSON(CHAVE_CHAMADAS, {});
const contarPresentes = data => URL_PLANILHA ? (cachePresentes[data] ?? null) : (lerChamadasLocais()[data] || []).length;
const cachePresentes = {};
const horaAgora = () => new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

async function enviarPlanilha(dados) {
  // text/plain evita bloqueio de CORS no Apps Script
  const r = await fetch(URL_PLANILHA, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(dados) });
  return r.json();
}

const presencas = {
  async listar(data) {
    if (!URL_PLANILHA) return lerChamadasLocais()[data] || [];
    const r = await fetch(`${URL_PLANILHA}?data=${data}&senha=${encodeURIComponent(senhaProf())}`).then(r => r.json());
    if (!r.ok) throw new Error(r.erro);
    cachePresentes[data] = r.presentes.length;
    return r.presentes;
  },
  async registrar(data, nome, ra, comoProfessor) {
    if (!URL_PLANILHA) {
      const todas = lerChamadasLocais();
      todas[data] ||= [];
      if (todas[data].some(p => p.ra === ra)) return { ok: false, erro: `O RA ${ra} já está na chamada deste encontro.` };
      const hora = horaAgora();
      todas[data].push({ nome, ra, hora });
      salvarJSON(CHAVE_CHAMADAS, todas);
      return { ok: true, hora };
    }
    return enviarPlanilha({ acao: "presenca", data, nome, ra, senha: comoProfessor ? senhaProf() : "" });
  },
  async remover(data, ra) {
    if (!URL_PLANILHA) {
      const todas = lerChamadasLocais();
      todas[data] = (todas[data] || []).filter(p => p.ra !== ra);
      salvarJSON(CHAVE_CHAMADAS, todas);
      return { ok: true };
    }
    return enviarPlanilha({ acao: "remover", data, ra, senha: senhaProf() });
  },
};


// ---------- Chamada (tela do professor) ----------
let atualizacaoAoVivo = null;   // recarrega a lista enquanto a chamada está aberta
modal.addEventListener("close", () => {
  clearInterval(atualizacaoAoVivo);
  if (!$("area-professor").hidden) desenharCalendarios();
});

function abrirChamada(data) {
  abrir(`
    <div class="chamada">
      <div class="chamada-topo">
        <h1>Chamada · ${dataBR(data)}</h1>
        <button class="acao" id="c-qr">Mostrar QR code</button>
      </div>
      <form id="form-chamada" autocomplete="off">
        <input id="c-nome" placeholder="Nome completo" required>
        <input id="c-ra" placeholder="RA" inputmode="numeric" required>
        <button>Registrar presença</button>
      </form>
      <p class="aviso" id="c-aviso"></p>
      <div class="total"><span>Total de presentes</span><b id="c-total">0</b></div>
      <table>
        <thead><tr><th>#</th><th>Nome</th><th>RA</th><th>Horário</th><th></th></tr></thead>
        <tbody id="c-lista"></tbody>
      </table>
      <div class="acoes">
        <button class="acao" id="c-exportar">Exportar este encontro</button>
        <button class="acao claro" id="c-exportar-todos">Exportar todos os encontros</button>
      </div>
    </div>`);

  const campoNome = $("c-nome"), campoRA = $("c-ra"), aviso = $("c-aviso");
  let removerQuem = null;   // pede um segundo clique no × antes de remover

  async function mostrarLista() {
    let lista;
    try { lista = await presencas.listar(data); }
    catch (erro) { aviso.textContent = "Não foi possível carregar a lista: " + erro.message; return; }
    if (!$("c-lista")) return;   // a janela já foi fechada

    $("c-total").textContent = lista.length;
    $("c-lista").innerHTML = lista.map((p, i) => `
      <tr>
        <td>${i + 1}</td><td>${escapar(p.nome)}</td><td>${escapar(p.ra)}</td><td>${p.hora}</td>
        <td><button aria-label="Remover ${escapar(p.nome)}" data-ra="${escapar(p.ra)}" data-nome="${escapar(p.nome)}">×</button></td>
      </tr>`).join("");

    document.querySelectorAll("#c-lista button").forEach(botao => {
      botao.onclick = async () => {
        if (removerQuem !== botao.dataset.ra) {
          removerQuem = botao.dataset.ra;
          aviso.textContent = `Clique no × de novo para remover ${botao.dataset.nome}.`;
          return;
        }
        removerQuem = null;
        aviso.textContent = "";
        await presencas.remover(data, botao.dataset.ra);
        mostrarLista();
      };
    });
  }

  $("form-chamada").onsubmit = async ev => {
    ev.preventDefault();
    const nome = campoNome.value.trim().replace(/\s+/g, " ");
    const ra = campoRA.value.trim();
    if (!nome || !ra) return;

    const r = await presencas.registrar(data, nome, ra, true);
    if (!r.ok) { aviso.textContent = r.erro; return; }
    aviso.textContent = "";
    campoNome.value = "";
    campoRA.value = "";
    campoNome.focus();
    mostrarLista();
  };

  $("c-qr").onclick = () => mostrarQR(data);
  $("c-exportar").onclick = () => exportarPlanilha([data]);
  $("c-exportar-todos").onclick = () => exportarPlanilha(URL_PLANILHA ? ENCONTROS.map(e => e.data) : Object.keys(lerChamadasLocais()).sort());

  mostrarLista();
  if (URL_PLANILHA) atualizacaoAoVivo = setInterval(mostrarLista, 5000);
  campoNome.focus();
}


// ---------- QR code para projetar na tela ----------
function mostrarQR(data) {
  clearInterval(atualizacaoAoVivo);
  const link = `${location.origin}${location.pathname}?presenca=${data}`;

  if (!URL_PLANILHA) {
    abrir(`<div class="qr-tela"><h1>Falta ligar a planilha</h1>
      <p class="qr-dica">Para os alunos responderem pelo celular, as respostas precisam ir para a Planilha Google.
      Siga o passo a passo do arquivo LEIA-ME-chamada.txt e cole o link em URL_PLANILHA, no topo do script.js.</p>
      <button class="acao" id="qr-voltar">Voltar para a chamada</button></div>`);
    $("qr-voltar").onclick = () => abrirChamada(data);
    return;
  }

  abrir(`
    <div class="qr-tela">
      <p class="qr-dica">Aponte a câmera do celular para registrar sua presença</p>
      <h1>Chamada · ${dataBR(data)}</h1>
      <div id="qr-codigo"></div>
      <p class="qr-total"><b id="qr-total">${cachePresentes[data] ?? 0}</b> presentes</p>
      <button class="acao claro" id="qr-voltar">Voltar para a lista</button>
    </div>`);
  new QRCode($("qr-codigo"), { text: link, width: 340, height: 340, colorDark: "#3A1A5C", colorLight: "#ffffff" });
  $("qr-voltar").onclick = () => abrirChamada(data);

  const atualizarTotal = async () => {
    try { const lista = await presencas.listar(data); if ($("qr-total")) $("qr-total").textContent = lista.length; } catch {}
  };
  atualizarTotal();
  atualizacaoAoVivo = setInterval(atualizarTotal, 5000);
}


// ---------- Página do aluno (aberta pelo QR code) ----------
function paginaDoAluno(data) {
  const chave = "inlaw-respondi-" + data;
  const jaRespondeu = lerJSON(chave, null);

  abrir(`
    <form class="login presenca" id="form-presenca" autocomplete="on">
      <img src="logo.png" alt="Selo InLaw" class="presenca-logo">
      <h1>Presença · ${dataBR(data)}</h1>
      <p>Encontro do InLaw – Laboratório de Inovação e Direito</p>
      <div id="presenca-campos">
        <input id="p-nome" name="name" placeholder="Nome completo" autocomplete="name" required>
        <input id="p-ra" placeholder="RA" inputmode="numeric" required>
        <p class="aviso" id="p-aviso" style="color:#B3261E;min-height:1.2em;margin:0 0 10px"></p>
        <button id="p-enviar">Registrar presença</button>
      </div>
    </form>`);

  const concluido = hora => {
    $("presenca-campos").innerHTML = `<p class="presenca-ok">✓ Presença registrada${hora ? " às " + hora : ""}.<br>Bom encontro!</p>`;
  };
  if (jaRespondeu) return concluido(jaRespondeu.hora);

  $("form-presenca").onsubmit = async ev => {
    ev.preventDefault();
    const nome = $("p-nome").value.trim().replace(/\s+/g, " ");
    const ra = $("p-ra").value.trim();
    if (!nome || !ra) return;

    $("p-enviar").disabled = true;
    $("p-enviar").textContent = "Enviando…";
    try {
      const r = await presencas.registrar(data, nome, ra, false);
      if (!r.ok) throw new Error(r.erro);
      salvarJSON(chave, { hora: r.hora });
      concluido(r.hora);
    } catch (erro) {
      $("p-aviso").textContent = erro.message || "Não foi possível enviar. Tente de novo.";
      $("p-enviar").disabled = false;
      $("p-enviar").textContent = "Registrar presença";
    }
  };
  $("p-nome").focus();
}


// ---------- Planilha exportada (.csv, abre no Excel) ----------
async function exportarPlanilha(datas) {
  const celula = v => `"${String(v).replace(/"/g, '""')}"`;
  const linha = valores => valores.map(celula).join(";");

  const linhas = [linha(["Data do encontro", "Nº", "Nome", "RA", "Horário da resposta"])];
  for (const data of datas) {
    let lista = [];
    try { lista = await presencas.listar(data); } catch {}
    if (URL_PLANILHA && datas.length > 1 && !lista.length) continue;   // pula encontros sem chamada
    lista.forEach((p, i) => linhas.push(linha([dataBR(data), i + 1, p.nome, p.ra, p.hora])));
    linhas.push(linha([dataBR(data), "", "TOTAL DE PRESENTES", lista.length, ""]));
    linhas.push("");
  }

  const arquivo = new Blob(["﻿" + linhas.join("\r\n")], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(arquivo);
  link.download = datas.length === 1
    ? `chamada-inlaw-${datas[0]}.csv`
    : `chamadas-inlaw-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}


// ---------- Ao carregar a página ----------
try { if (sessionStorage.getItem("inlaw-prof") === "1") document.body.classList.add("prof"); } catch {}

const dataDaPresenca = new URLSearchParams(location.search).get("presenca");
if (dataDaPresenca) paginaDoAluno(dataDaPresenca);


// ---------- Galeria em movimento ----------
function mostrarFotos(fotos) {
  const galeria = $("fotos");
  if (!fotos.length) {
    galeria.innerHTML = '<p class="vazio">As fotos aparecem aqui assim que forem adicionadas.</p>';
    return;
  }

  const caminho = PASTA_FOTOS ? PASTA_FOTOS + "/" : "";
  const foto = n => `<button aria-label="Ampliar foto: ${nomeDoArquivo(n)}"><img src="${caminho}${n}" alt="${nomeDoArquivo(n)}"></button>`;

  // cada faixa repete as fotos para a rolagem nunca ter buraco
  const faixa = (lista, aoContrario) => {
    let repetidas = lista;
    while (repetidas.length < 8) repetidas = repetidas.concat(lista);
    const html = repetidas.map(foto).join("");
    const tempo = Math.max(30, lista.length * 9);
    return `<div class="trilho${aoContrario ? " volta" : ""}" style="--tempo:${tempo}s">${html}${html}</div>`;
  };

  // com mais de 5 fotos, divide em duas faixas que andam em sentidos opostos
  const meio = Math.ceil(fotos.length / 2);
  galeria.innerHTML = fotos.length > 5
    ? faixa(fotos.slice(0, meio)) + faixa(fotos.slice(meio), true)
    : faixa(fotos);

  galeria.querySelectorAll("button").forEach(botao => {
    botao.onclick = () => {
      const img = botao.querySelector("img");
      abrir(`<img class="cheia" src="${img.src}" alt="${img.alt}">`);
    };
  });
}

const ehFotoDaGaleria = arq =>
  arq.type === "file" &&
  /\.(jpe?g|png|webp)$/i.test(arq.name) &&
  !/^(logo|favicon|capa|encontro)\./i.test(arq.name);   // essas são usadas em outros lugares

fetch(urlGitHub(PASTA_FOTOS))
  .then(r => r.ok ? r.json() : Promise.reject())
  .then(arquivos => mostrarFotos(arquivos.filter(ehFotoDaGaleria).map(a => a.name)))
  .catch(() => mostrarFotos(FOTOS_PADRAO));


// ---------- Blog em feed ----------
/* Cada post é um arquivo .md na pasta blog/:
     # Coordenador de Proteção de Dados
     serie: As Profissões do Futuro! | autor: Nome | data: 24/10/2026
     (texto em Markdown...)
   Opcional na 2ª linha: "capa: foto.jpg" usa a imagem do Insta no lugar do card desenhado. */

function lerPost(texto, arquivo) {
  const linhas = texto.split("\n");
  let titulo = nomeDoArquivo(arquivo);
  const info = {};

  if (linhas[0]?.startsWith("# ")) titulo = linhas.shift().slice(2).trim();
  if (/^(serie|série|autor|data|capa):/i.test(linhas[0] || "")) {
    linhas.shift().split("|").forEach(parte => {
      const [chave, ...valor] = parte.split(":");
      info[chave.trim().toLowerCase().replace("série", "serie")] = valor.join(":").trim();
    });
  }

  return {
    titulo,
    serie: info.serie || "InLaw Explica",
    autor: info.autor || "",
    data:  info.data  || "",
    capa:  info.capa  || "",
    corpo: linhas.join("\n").trim(),
  };
}

const resumo = md => md.replace(/[#*_>`\[\]]/g, "").replace(/\(.*?\)/g, "").replace(/\s+/g, " ").trim();
const iconeLupa   = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><circle cx="10" cy="10" r="7"/><path d="M15 15l6 6"/></svg>';
const iconeCursor = '<svg width="18" height="22" viewBox="0 0 18 22"><path d="M2 1v17l4.5-4 3 7 3-1.3-3-6.8H16z" fill="#fff" stroke="#111" stroke-width="1.2"/></svg>';

// O quadrado no estilo dos posts do Instagram
function arteDoPost(p) {
  if (p.capa) return `<div class="arte foto" style="background-image:url('${p.capa}')" role="img" aria-label="${p.titulo}"></div>`;
  return `<div class="arte" aria-hidden="true">
    <span class="menu-i"><i></i><i></i><i></i></span>
    <span class="serie">${p.serie}</span>
    <span class="elipse"></span>
    <span class="titulo">${p.titulo}</span>
    <span class="busca">Você sabe o que é? <b>${iconeLupa}</b></span>
    <span class="legenda">Leia a legenda ${iconeCursor}</span>
  </div>`;
}

function mostrarFeed(posts) {
  let filtro = "Todos";
  const series = ["Todos", ...new Set(posts.map(p => p.serie))];

  function desenhar() {
    // botões de filtro só aparecem se houver mais de uma série
    $("filtros").innerHTML = series.length > 2
      ? series.map(s => `<button aria-pressed="${s === filtro}">${s}</button>`).join("")
      : "";
    document.querySelectorAll("#filtros button").forEach(botao => {
      botao.onclick = () => { filtro = botao.textContent; desenhar(); };
    });

    $("posts").innerHTML = posts
      .filter(p => filtro === "Todos" || p.serie === filtro)
      .map(p => `
        <button class="post" data-i="${posts.indexOf(p)}">
          ${arteDoPost(p)}
          <div class="info">
            <small>${[p.autor, p.data].filter(Boolean).join(" · ") || p.serie}</small>
            <h3>${p.titulo}</h3>
            <p>${resumo(p.corpo)}</p>
            <span class="ler">Ler explicação</span>
          </div>
        </button>`).join("");

    document.querySelectorAll(".post").forEach(botao => {
      botao.onclick = () => {
        const p = posts[botao.dataset.i];
        abrir(`<article class="leitura">
          <small>${[p.serie, p.autor, p.data].filter(Boolean).join(" · ")}</small>
          <h1>${p.titulo}</h1>
          ${marked.parse(p.corpo)}
        </article>`);
      };
    });
  }

  desenhar();
}

fetch(urlGitHub(PASTA_BLOG))
  .then(r => r.ok ? r.json() : Promise.reject())
  .then(arquivos => Promise.all(
    arquivos
      .filter(a => a.name.endsWith(".md"))
      .sort((a, b) => b.name.localeCompare(a.name))   // mais novos primeiro
      .map(a => fetch(`${PASTA_BLOG}/${a.name}`).then(r => r.text()).then(t => lerPost(t, a.name)))
  ))
  .then(posts => mostrarFeed([...posts, ...POSTS_EXEMPLO]))
  .catch(() => mostrarFeed(POSTS_EXEMPLO));
