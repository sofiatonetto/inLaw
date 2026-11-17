const GITHUB_USUARIO = "sofiatonetto";
const GITHUB_REPO    = "inLaw";
const BRANCH         = "main";
const PASTA_FOTOS    = "";      
const PASTA_BLOG     = "blog";

// Membros ativos (um nome por item)
const MEMBROS = [
  "Larissa Rodrigues Ribeiro",
  "Lavinya De Vargas",
  "Suellen Camille Berg de Melo",
  "Joanna Funck",
  "Marlei Costa",
  "Ana Francisca Meirelles Izalanski",
  "Luéllen Smolareck",
  "João Schenini Trodo",
  "Jaciani da Silva",
  "Mariely Martins Fagundes",
  "Matheus Almeida de Siqueira",
  "Luiza Charão Dutra",
  "Vitoria Jacques Maronn",
  "Livia Garay", 
  "Ana Laura Simionato", 
  "Milton Airison", 
  "Sofia Valentina Tonetto",
];

// Encontros: o professor cria e exclui pelo botão "+ Novo encontro", na Área do professor.
// Eles ficam guardados na Planilha Google. Não precisa mexer aqui.
// (Esta lista só é usada uma vez, para levar os encontros antigos para a planilha.)
const ENCONTROS = [
  { data: "2026-11-09", tema: "" },
];

// Link do "App da Web" da Planilha Google (passo a passo no LEIA-ME-chamada.txt).
// A senha da Área do professor fica guardada só na planilha, nunca aqui no site.
const URL_PLANILHA = "https://script.google.com/macros/s/AKfycbxVPvnEttc24WQp4ZeiqADl3fDhFiGWXI9XBtrlvnrF74vqHeQSBN1FoKa1J5kN5wZUUw/exec";

// Fotos usadas na galeria se o site não conseguir ler o GitHub
const FOTOS_PADRAO = [
  "inlawexp.jpeg",
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


const $ = id => document.getElementById(id);
const escapar = t => String(t ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
// "Ána  SOUZA" -> "ana souza": usado para não contar a mesma pessoa duas vezes
const mesmoNome = n => String(n).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
const dataValida = t => /^\d{4}-\d{2}-\d{2}$/.test(t) && !isNaN(new Date(t + "T12:00"));
const dataBR = iso => String(iso).split("-").reverse().join("/");          // 2026-05-07 -> 07/05/2026
const nomeDoArquivo = n => n.replace(/\.\w+$/, "").replace(/[-_]/g, " ");  // encontro-do-grupo.jpg -> encontro do grupo
const urlGitHub = pasta => `https://api.github.com/repos/${GITHUB_USUARIO}/${GITHUB_REPO}/contents/${pasta}?ref=${BRANCH}`;
const hojeISO = () => new Date().toLocaleDateString("sv-SE");              // 2026-11-17
// Nomes válidos: começam com letra, só letras, espaços, apóstrofo, ponto e hífen
const nomeValido = n => /^\p{L}[\p{L}\p{M}' .-]{2,79}$/u.test(n) && /\s/.test(n);

function lerJSON(chave, padrao) {
  try { return JSON.parse(localStorage.getItem(chave)) || padrao; } catch { return padrao; }
}
function salvarJSON(chave, valor) {
  try { localStorage.setItem(chave, JSON.stringify(valor)); } catch {}
}

// Limpa o HTML gerado pelos posts do blog: só deixa formatação de texto, sem scripts
const TAGS_PERMITIDAS = new Set(["P", "BR", "STRONG", "B", "EM", "I", "U", "S", "A", "UL", "OL", "LI", "BLOCKQUOTE",
  "H1", "H2", "H3", "H4", "H5", "H6", "CODE", "PRE", "HR", "IMG", "TABLE", "THEAD", "TBODY", "TR", "TH", "TD", "SPAN"]);
const urlSegura = u => /^(https?:|mailto:|#|\/|\.\/|[\w-]+(\/[\w.-]+)*\.\w+$)/i.test(String(u).trim()) && !/^\s*javascript:/i.test(u);
function htmlSeguro(html) {
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  const limpar = no => {
    [...no.children].forEach(el => {
      if (!TAGS_PERMITIDAS.has(el.tagName)) { el.replaceWith(document.createTextNode(el.textContent)); return; }
      [...el.attributes].forEach(a => {
        const ok = (el.tagName === "A" && a.name === "href" && urlSegura(a.value)) ||
                   (el.tagName === "IMG" && (a.name === "alt" || (a.name === "src" && urlSegura(a.value))));
        if (!ok) el.removeAttribute(a.name);
      });
      if (el.tagName === "A") { el.setAttribute("target", "_blank"); el.setAttribute("rel", "noopener noreferrer"); }
      limpar(el);
    });
  };
  limpar(doc.body.firstChild);
  return doc.body.firstChild.innerHTML;
}

// O site não pode ser aberto dentro de outro site (evita golpes de "clique escondido")
if (window.top !== window.self) { try { window.top.location = window.self.location; } catch { document.body.innerHTML = ""; } }


// ---------- Janela (modal) ----------
const modal = $("modal");
modal.addEventListener("click", e => { if (e.target === modal) modal.close(); });
modal.querySelector(".fechar")?.addEventListener("click", () => modal.close());

function abrir(html) {
  $("modal-conteudo").innerHTML = html;
  if (!modal.open) modal.showModal();
}


// ---------- Menu do celular ----------
document.querySelector(".menu-btn")?.addEventListener("click", () => $("menu").classList.toggle("aberto"));
$("menu")?.addEventListener("click", () => $("menu").classList.remove("aberto"));


// ---------- Rodapé e membros ----------
// (o "?." evita que o site trave se algum elemento não existir no index.html)
$("ano")?.replaceChildren(String(new Date().getFullYear()));
$("membros")?.replaceChildren(...MEMBROS.map(nome => Object.assign(document.createElement("li"), { textContent: nome })));


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


// ---------- Estilos dos botões novos (ficam aqui para não depender do estilo.css) ----------
document.head.insertAdjacentHTML("beforeend", `<style>
  #form-encontro input { display:block; width:100%; box-sizing:border-box; margin:0 0 10px; }
  .excluir-encontro { display:block; margin:8px auto 0; padding:2px 6px; background:none; border:0;
    font:inherit; font-size:.78rem; color:#8a7a99; text-decoration:underline; cursor:pointer; }
  .excluir-encontro:hover, .excluir-encontro.confirmar { color:#B3261E; }
  .excluir-encontro.confirmar { font-weight:600; }
  .aviso-encontros { background:#FFF4E5; border-left:4px solid #D9822B; padding:10px 14px; margin:0 0 24px; color:#5a3a12; }
</style>`);


const VERSAO_PLANILHA = 3;
const passeProf = () => { try { return sessionStorage.getItem("inlaw-passe") || ""; } catch { return ""; } };

async function planilha(dados) {
  if (!URL_PLANILHA) throw new Error("Falta colar o link da planilha em URL_PLANILHA, no topo do script.js.");
  let r;
  try {
    // text/plain evita bloqueio de CORS no Apps Script
    r = await fetch(URL_PLANILHA, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(dados) }).then(r => r.json());
  } catch {
    throw new Error("Sem conexão com a planilha. Confira a internet e tente de novo.");
  }
  if ((r.versao || 0) < VERSAO_PLANILHA) throw new Error("O código da planilha está desatualizado. Instale o Codigo.gs novo (veja o LEIA-ME-chamada.txt).");
  if (r.sessao === false) { sairDoModoProfessor(); throw new Error(r.erro); }
  return r;
}
const comoProfessor = dados => planilha({ ...dados, token: passeProf() });


// ---------- Encontros (guardados na planilha) ----------
// A lista fica também na memória desta aba, para aparecer na hora; a planilha confirma em seguida.
let encontros = lerSessao("inlaw-encontros-cache");   // null = ainda não carregou
let erroEncontros = "";
let avisoTemporario = "";

function lerSessao(chave) { try { return JSON.parse(sessionStorage.getItem(chave)); } catch { return null; } }
function salvarSessao(chave, valor) { try { sessionStorage.setItem(chave, JSON.stringify(valor)); } catch {} }

function guardarEncontros(lista) {
  encontros = lista;
  salvarSessao("inlaw-encontros-cache", lista);
}

// mostra um aviso no topo do painel por alguns segundos
function avisarNoPainel(texto) {
  avisoTemporario = texto;
  desenharCalendarios();
  setTimeout(() => { if (avisoTemporario === texto) { avisoTemporario = ""; desenharCalendarios(); } }, 6000);
}

async function receberEncontros(r) {
  if (!r.migrado) {   // primeira vez: leva os encontros antigos do site para a planilha
    const antigos = [...ENCONTROS, ...(lerJSON("inlaw-encontros", {}).criados || [])].filter(e => dataValida(e?.data));
    r = await comoProfessor({ acao: "migrarEncontros", lista: antigos });
    if (!r.ok) throw new Error(r.erro);
  }
  guardarEncontros(r.encontros);
  erroEncontros = "";
}

async function carregarEncontros() {
  try {
    const r = await comoProfessor({ acao: "encontros" });
    if (!r.ok) throw new Error(r.erro);
    await receberEncontros(r);
  } catch (erro) {
    if (!encontros) erroEncontros = erro.message;   // se já tem a lista na tela, só mantém
  }
}

// Muda na tela na hora; se a planilha recusar, desfaz e avisa
async function mudarEncontros(dados, mudancaNaTela) {
  const antes = encontros || [];
  guardarEncontros(mudancaNaTela(antes));
  desenharCalendarios();
  try {
    const r = await comoProfessor(dados);
    if (!r.ok) throw new Error(r.erro || "A planilha não aceitou a mudança.");
    guardarEncontros(r.encontros);
  } catch (erro) {
    guardarEncontros(antes);
    avisarNoPainel(erro.message);
    return;
  }
  desenharCalendarios();
}

function novoEncontro() {
  abrir(`
    <form class="login" id="form-encontro">
      <h1>Novo encontro</h1>
      <p>Escolha a data. O tema é opcional.</p>
      <input type="date" id="e-data" value="${hojeISO()}" required>
      <input id="e-tema" placeholder="Tema (opcional)" maxlength="80" autocomplete="off">
      <p class="aviso" id="e-aviso" style="color:#B3261E;min-height:1.2em;margin:0 0 10px"></p>
      <button id="e-criar">Criar encontro</button>
    </form>`);
  $("e-data").focus();

  $("form-encontro").onsubmit = ev => {
    ev.preventDefault();
    const data = $("e-data").value;
    const tema = $("e-tema").value.trim().replace(/\s+/g, " ");
    if (!dataValida(data)) { $("e-aviso").textContent = "Escolha uma data válida."; return; }
    if ((encontros || []).some(e => e.data === data)) { $("e-aviso").textContent = `Já existe um encontro em ${dataBR(data)}.`; return; }
    modal.close();
    mudarEncontros({ acao: "encontro", data, tema }, lista => [...lista, { data, tema, salvando: true }]);
  };
}


// ---------- Encontros: mini calendários ----------
function desenharCalendarios() {
  if (!$("encontros")) return;
  if (erroEncontros) {
    $("encontros").innerHTML = `<p class="aviso-encontros">${escapar(erroEncontros)}</p>`;
    return;
  }
  const aviso = avisoTemporario ? `<p class="aviso-encontros">${escapar(avisoTemporario)}</p>` : "";
  if (!encontros) { $("encontros").innerHTML = '<p class="vazio">Carregando encontros…</p>'; return; }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const lista = encontros
    .filter(e => dataValida(e.data))
    .map(e => ({ ...e, dia: new Date(e.data + "T12:00") }))
    .sort((a, b) => a.dia - b.dia);
  const proximo = lista.find(e => e.dia >= hoje);

  // agrupa por semestre: "2026 · 1º semestre"
  const semestres = {};
  lista.forEach(e => {
    const nome = `${e.dia.getFullYear()} · ${e.dia.getMonth() < 6 ? 1 : 2}º semestre`;
    (semestres[nome] ||= []).push(e);
  });

  const diaDaSemana = d => d.toLocaleDateString("pt-BR", { weekday: "long" });
  const noPlural = d => diaDaSemana(d).split("-")[0] + "s";   // "segunda-feira" -> "segundas"

  const calendario = e => {
    const classe = e === proximo ? "proximo" : e.dia < hoje ? "passado" : "";
    const total = cachePresentes[e.data];
    return `
        <div class="cal ${classe}">
          <div class="mes">${e.dia.toLocaleDateString("pt-BR", { month: "long" })}</div>
          <div class="dia"><b>${e.dia.getDate()}</b><small>${diaDaSemana(e.dia)}</small></div>
          ${e.tema ? `<div class="tema">${escapar(e.tema)}</div>` : ""}
          ${e.salvando
            ? '<button class="abrir-chamada" disabled>Salvando…<small>aguarde</small></button>'
            : `<button class="abrir-chamada" data-data="${e.data}">Chamada<small>${total === undefined ? "abrir" : total + " presentes"}</small></button>
          <button class="excluir-encontro" type="button" data-data="${e.data}">Excluir</button>`}
        </div>`;
  };

  if (!lista.length) {
    $("encontros").innerHTML = aviso + '<p class="vazio">Nenhum encontro cadastrado ainda. Clique em “+ Novo encontro” para criar o primeiro.</p>';
    return;
  }
  $("encontros").innerHTML = aviso + Object.entries(semestres).reverse().map(([nome, doSemestre]) => `
    <div class="semestre">
      <div class="semestre-topo"><h3>${nome}</h3><span>Encontros às ${[...new Set(doSemestre.map(e => noPlural(e.dia)))].join(" e ")}</span></div>
      <div class="calendarios">${doSemestre.map(calendario).join("")}</div>
    </div>`).join("");

  document.querySelectorAll(".abrir-chamada[data-data]").forEach(botao => {
    botao.onclick = () => abrirChamada(botao.dataset.data);
  });

  // Excluir pede um segundo clique para confirmar (as presenças já registradas não são apagadas)
  document.querySelectorAll(".excluir-encontro").forEach(botao => {
    botao.onclick = () => {
      if (!botao.classList.contains("confirmar")) {
        document.querySelectorAll(".excluir-encontro.confirmar").forEach(b => { b.classList.remove("confirmar"); b.textContent = "Excluir"; });
        botao.classList.add("confirmar");
        botao.textContent = "Clique de novo para excluir";
        return;
      }
      const data = botao.dataset.data;
      mudarEncontros({ acao: "excluirEncontro", data }, lista => lista.filter(e => e.data !== data));
    };
  });
}


// ---------- Área do professor ----------
async function entrarNoModoProfessor(r) {
  try { sessionStorage.setItem("inlaw-passe", r.token); } catch {}
  document.body.classList.add("prof");
  if (Array.isArray(r.encontros)) {   // a planilha já mandou os encontros junto com o login
    abrirPainel(false);
    try { await receberEncontros(r); } catch (erro) { erroEncontros = erro.message; }
    desenharCalendarios();
  } else {
    abrirPainel();
  }
}

function sairDoModoProfessor() {
  const passe = passeProf();
  if (passe) planilha({ acao: "sair", token: passe }).catch(() => {});
  try { sessionStorage.removeItem("inlaw-passe"); sessionStorage.removeItem("inlaw-senha"); sessionStorage.removeItem("inlaw-prof"); } catch {}
  document.body.classList.remove("prof");
  encontros = null;
  try { sessionStorage.removeItem("inlaw-encontros-cache"); sessionStorage.removeItem("inlaw-listas-cache"); } catch {}
  fecharPainel();
}

// Painel da área do professor (abre por cima do site)
function abrirPainel(recarregar = true) {
  if (!$("area-professor")) return;
  $("area-professor").hidden = false;
  document.body.classList.add("painel-aberto");
  desenharCalendarios();   // mostra na hora o que já tem na memória
  if (recarregar) carregarEncontros().then(desenharCalendarios);
}
function fecharPainel() {
  if (!$("area-professor")) return;
  $("area-professor").hidden = true;
  document.body.classList.remove("painel-aberto");
}

const aoClicar = (id, fn) => { const el = $(id); if (el) el.onclick = fn; };
aoClicar("btn-prof", () => passeProf() ? abrirPainel() : pedirSenha());   // ícone de pessoa no topo
aoClicar("fechar-painel", fecharPainel);
aoClicar("sair-prof", sairDoModoProfessor);
if (!$("novo-encontro") && document.querySelector(".painel-acoes")) {
  const botao = Object.assign(document.createElement("button"), { id: "novo-encontro", type: "button", className: "acao", textContent: "+ Novo encontro" });
  document.querySelector(".painel-acoes").prepend(botao);
}
aoClicar("novo-encontro", novoEncontro);
aoClicar("exportar-tudo", () => exportarPlanilha((encontros || []).map(e => e.data)));

function pedirSenha() {
  abrir(`
    <form class="login" id="form-login">
      <h1>Área do professor</h1>
      <p>Acesso restrito à coordenação para fazer a chamada dos encontros.</p>
      <input type="password" id="senha" placeholder="Senha" autocomplete="current-password" required>
      <p class="aviso" id="erro-login" style="color:#B3261E;min-height:1.2em;margin:0 0 10px"></p>
      <button id="entrar">Entrar</button>
    </form>`);
  $("senha").focus();

  $("form-login").onsubmit = async ev => {
    ev.preventDefault();
    $("entrar").disabled = true;
    $("entrar").textContent = "Conferindo…";
    try {
      const r = await planilha({ acao: "login", senha: $("senha").value });
      if (!r.ok) throw new Error(r.erro);
      modal.close();
      entrarNoModoProfessor(r);
    } catch (erro) {
      $("erro-login").textContent = erro.message;
      $("entrar").disabled = false;
      $("entrar").textContent = "Entrar";
      $("senha").select();
    }
  };
}


// ---------- Presenças ----------
const cachePresentes = {};

const presencas = {
  async listar(data) {
    const r = await comoProfessor({ acao: "listar", data });
    if (!r.ok) throw new Error(r.erro);
    cachePresentes[data] = r.presentes.length;
    return r.presentes;
  },
  registrar: (data, nome, ehProfessor) => ehProfessor ? comoProfessor({ acao: "presenca", data, nome }) : planilha({ acao: "presenca", data, nome }),
  async remover(data, nome) {
    const r = await comoProfessor({ acao: "remover", data, nome });
    if (!r.ok) throw new Error(r.erro);
  },
};


const listas = lerSessao("inlaw-listas-cache") || {};
Object.entries(listas).forEach(([d, l]) => { cachePresentes[d] = l.length; });
let rodadaAoVivo = 0;   // cada tela aberta ganha um número; ao trocar de tela, a atualização antiga para

function guardarLista(data, lista) {
  listas[data] = lista;
  cachePresentes[data] = lista.length;
  salvarSessao("inlaw-listas-cache", listas);
}

function aoVivo(fn, intervalo = 4000) {
  const minha = ++rodadaAoVivo;
  (async function volta() {
    if (minha !== rodadaAoVivo || !modal.open) return;
    await fn();
    setTimeout(volta, intervalo);
  })();
}
modal.addEventListener("close", () => {
  rodadaAoVivo++;
  if ($("area-professor") && !$("area-professor").hidden) desenharCalendarios();
});

function abrirChamada(data) {
  if (!dataValida(data)) return;
  abrir(`
    <div class="chamada">
      <div class="chamada-topo">
        <h1>Chamada · ${dataBR(data)}</h1>
        <button class="acao" id="c-qr">Mostrar QR code</button>
      </div>
      <form id="form-chamada" autocomplete="off">
        <input id="c-nome" placeholder="Nome completo" maxlength="80" required>
        <button id="c-registrar">Registrar presença</button>
      </form>
      <p class="aviso" id="c-aviso"></p>
      <div class="total"><span>Total de presentes</span><b id="c-total">…</b></div>
      <table>
        <thead><tr><th>#</th><th>Nome</th><th>Horário</th><th></th></tr></thead>
        <tbody id="c-lista"></tbody>
      </table>
      <div class="acoes">
        <button class="acao" id="c-exportar">Exportar este encontro</button>
        <button class="acao claro" id="c-exportar-todos">Exportar todos os encontros</button>
      </div>
    </div>`);

  const campoNome = $("c-nome"), aviso = $("c-aviso");
  let removerQuem = null;      
  let pendentes = [];         
  let removidos = new Set();   

  function desenharLista() {
    if (!$("c-lista")) return;   // a janela já foi fechada
    const daPlanilha = (listas[data] || []).filter(p => !removidos.has(mesmoNome(p.nome)));
    const lista = [...daPlanilha, ...pendentes.filter(p => !daPlanilha.some(x => mesmoNome(x.nome) === mesmoNome(p.nome)))];
    $("c-total").textContent = listas[data] ? lista.length : "…";
    $("c-lista").innerHTML = lista.map((p, i) => `
      <tr${p.salvando ? ' style="opacity:.55"' : ""}>
        <td>${i + 1}</td><td>${escapar(p.nome)}</td><td>${p.salvando ? "salvando…" : escapar(p.hora)}</td>
        <td>${p.salvando ? "" : `<button aria-label="Remover ${escapar(p.nome)}" data-nome="${escapar(p.nome)}">×</button>`}</td>
      </tr>`).join("");

    document.querySelectorAll("#c-lista button").forEach(botao => {
      botao.onclick = async () => {
        const nome = botao.dataset.nome;
        if (removerQuem !== nome) {
          removerQuem = nome;
          aviso.textContent = `Clique no × de novo para remover ${nome}.`;
          return;
        }
        removerQuem = null;
        aviso.textContent = "";
        removidos.add(mesmoNome(nome));
        desenharLista();
        try {
          await presencas.remover(data, nome);
          guardarLista(data, (listas[data] || []).filter(p => mesmoNome(p.nome) !== mesmoNome(nome)));
        } catch (erro) {
          if ($("c-aviso")) aviso.textContent = erro.message;
        }
        removidos.delete(mesmoNome(nome));
        desenharLista();
      };
    });
  }

  async function buscarLista() {
    try { guardarLista(data, await presencas.listar(data)); }
    catch (erro) { if ($("c-aviso") && !listas[data]) aviso.textContent = "Não foi possível carregar a lista: " + erro.message; }
    desenharLista();
  }

  $("form-chamada").onsubmit = async ev => {
    ev.preventDefault();
    const nome = campoNome.value.trim().replace(/\s+/g, " ");
    if (!nome) return;
    if (!nomeValido(nome)) { aviso.textContent = "Escreva nome e sobrenome, só com letras."; return; }
    if ([...(listas[data] || []), ...pendentes].some(p => mesmoNome(p.nome) === mesmoNome(nome))) {
      aviso.textContent = `${nome} já está na chamada deste encontro.`;
      return;
    }

    const item = { nome, salvando: true };
    pendentes.push(item);
    aviso.textContent = "";
    campoNome.value = "";
    campoNome.focus();
    desenharLista();

    try {
      const r = await presencas.registrar(data, nome, true);
      if (!r.ok) throw new Error(r.erro);
      guardarLista(data, [...(listas[data] || []), { nome, hora: r.hora }]);
    } catch (erro) {
      if ($("c-aviso")) aviso.textContent = erro.message;
    }
    pendentes = pendentes.filter(p => p !== item);
    desenharLista();
  };

  $("c-qr").onclick = () => mostrarQR(data);
  $("c-exportar").onclick = () => exportarPlanilha([data]);
  $("c-exportar-todos").onclick = () => exportarPlanilha((encontros || []).map(e => e.data));

  desenharLista();   
  aoVivo(buscarLista);
  campoNome.focus();
}


function mostrarQR(data) {
  const link = `${location.origin}${location.pathname}?presenca=${data}`;
  const ehHoje = data === hojeISO();

  abrir(`
    <div class="qr-tela">
      <p class="qr-dica">Aponte a câmera do celular para registrar sua presença</p>
      <h1>Chamada · ${dataBR(data)}</h1>
      ${ehHoje ? "" : '<p class="aviso" style="color:#B3261E">Atenção: os alunos só conseguem marcar presença pelo QR code no dia do encontro.</p>'}
      <div id="qr-codigo"></div>
      <p class="qr-total"><b id="qr-total">${cachePresentes[data] ?? 0}</b> presentes</p>
      <button class="acao claro" id="qr-voltar">Voltar para a lista</button>
    </div>`);
  if (window.QRCode) new QRCode($("qr-codigo"), { text: link, width: 340, height: 340, colorDark: "#3A1A5C", colorLight: "#ffffff" });
  else $("qr-codigo").textContent = link;
  $("qr-voltar").onclick = () => abrirChamada(data);

  aoVivo(async () => {
    try { const lista = await presencas.listar(data); guardarLista(data, lista); if ($("qr-total")) $("qr-total").textContent = lista.length; } catch {}
  });
}


function paginaDoAluno(data) {
  const chave = "inlaw-respondi-" + data;
  const jaRespondeu = lerJSON(chave, null);

  abrir(`
    <form class="login presenca" id="form-presenca" autocomplete="on">
      <img src="logo.png" alt="Selo InLaw" class="presenca-logo">
      <h1>Presença · ${dataBR(data)}</h1>
      <p>Encontro do InLaw – Laboratório de Inovação e Direito</p>
      <div id="presenca-campos">
        <input id="p-nome" name="name" placeholder="Nome completo" autocomplete="name" maxlength="80" required>
        <p class="aviso" id="p-aviso" style="color:#B3261E;min-height:1.2em;margin:0 0 10px"></p>
        <button id="p-enviar">Registrar presença</button>
      </div>
    </form>`);

  const concluido = hora => {
    $("presenca-campos").innerHTML = `<p class="presenca-ok">✓ Presença registrada${hora ? " às " + escapar(hora) : ""}.<br>Bom encontro!</p>`;
  };
  if (jaRespondeu) return concluido(jaRespondeu.hora);

  $("form-presenca").onsubmit = async ev => {
    ev.preventDefault();
    const nome = $("p-nome").value.trim().replace(/\s+/g, " ");
    if (!nomeValido(nome)) { $("p-aviso").textContent = "Escreva seu nome completo (nome e sobrenome), só com letras."; return; }

    $("p-enviar").disabled = true;
    $("p-enviar").textContent = "Enviando…";
    try {
      const r = await presencas.registrar(data, nome, false);
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


async function exportarPlanilha(datas) {
  // células que começam com = + - @ virariam fórmula no Excel: o apóstrofo impede isso
  const celula = v => `"${String(v).replace(/^([=+\-@\t\r])/, "'$1").replace(/"/g, '""')}"`;
  const linha = valores => valores.map(celula).join(";");

  const linhas = [linha(["Data do encontro", "Nº", "Nome", "Horário da resposta"])];
  for (const data of datas) {
    let lista = [];
    try { lista = await presencas.listar(data); } catch {}
    if (datas.length > 1 && !lista.length) continue;   // pula encontros sem chamada
    lista.forEach((p, i) => linhas.push(linha([dataBR(data), i + 1, p.nome, p.hora])));
    linhas.push(linha([dataBR(data), "", "TOTAL DE PRESENTES", lista.length]));
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


try { sessionStorage.removeItem("inlaw-senha"); } catch {}   
if (passeProf()) document.body.classList.add("prof");

const dataDaPresenca = new URLSearchParams(location.search).get("presenca");
if (dataDaPresenca && dataValida(dataDaPresenca)) paginaDoAluno(dataDaPresenca);


function mostrarFotos(fotos) {
  const galeria = $("fotos");
  if (!galeria) return;
  if (!fotos.length) {
    galeria.innerHTML = '<p class="vazio">As fotos aparecem aqui assim que forem adicionadas.</p>';
    return;
  }

  const caminho = PASTA_FOTOS ? PASTA_FOTOS + "/" : "";
  const foto = n => `<button aria-label="Ampliar foto: ${escapar(nomeDoArquivo(n))}"><img src="${escapar(caminho + n)}" alt="${escapar(nomeDoArquivo(n))}"></button>`;

  const faixa = (lista, aoContrario) => {
    let repetidas = lista;
    while (repetidas.length < 8) repetidas = repetidas.concat(lista);
    const html = repetidas.map(foto).join("");
    const tempo = Math.max(30, lista.length * 9);
    return `<div class="trilho${aoContrario ? " volta" : ""}" style="--tempo:${tempo}s">${html}${html}</div>`;
  };

  const meio = Math.ceil(fotos.length / 2);
  galeria.innerHTML = fotos.length > 5
    ? faixa(fotos.slice(0, meio)) + faixa(fotos.slice(meio), true)
    : faixa(fotos);

  galeria.querySelectorAll("img").forEach(img => img.addEventListener("error", () => img.parentElement.remove()));

  galeria.querySelectorAll("button").forEach(botao => {
    botao.onclick = () => {
      const img = botao.querySelector("img");
      abrir(`<img class="cheia" src="${escapar(img.src)}" alt="${escapar(img.alt)}">`);
    };
  });
}

const ehFotoDaGaleria = arq =>
  arq.type === "file" &&
  /^[\w.-]+\.(jpe?g|png|webp)$/i.test(arq.name) &&
  !/^(favicon|icone|apple-touch-icon)|^(logo|capa|encontro|aline|pedro|cartilha)\./i.test(arq.name);   // essas são usadas em outros lugares do site

fetch(urlGitHub(PASTA_FOTOS))
  .then(r => r.ok ? r.json() : Promise.reject())
  .then(arquivos => mostrarFotos(arquivos.filter(ehFotoDaGaleria).map(a => a.name)))
  .catch(() => mostrarFotos(FOTOS_PADRAO));



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
  // capa: só nomes de arquivo simples ou links https
  if (p.capa && /^(https:\/\/[^\s'"()]+|[\w./-]+)$/.test(p.capa)) {
    return `<div class="arte foto" style="background-image:url('${escapar(p.capa)}')" role="img" aria-label="${escapar(p.titulo)}"></div>`;
  }
  return `<div class="arte" aria-hidden="true">
    <span class="menu-i"><i></i><i></i><i></i></span>
    <span class="serie">${escapar(p.serie)}</span>
    <span class="elipse"></span>
    <span class="titulo">${escapar(p.titulo)}</span>
    <span class="busca">Você sabe o que é? <b>${iconeLupa}</b></span>
    <span class="legenda">Leia a legenda ${iconeCursor}</span>
  </div>`;
}

function mostrarFeed(posts) {
  if (!$("posts")) return;
  let filtro = "Todos";
  const series = ["Todos", ...new Set(posts.map(p => p.serie))];

  function desenhar() {
    // botões de filtro só aparecem se houver mais de uma série
    $("filtros").innerHTML = series.length > 2
      ? series.map(s => `<button aria-pressed="${s === filtro}">${escapar(s)}</button>`).join("")
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
            <small>${escapar([p.autor, p.data].filter(Boolean).join(" · ") || p.serie)}</small>
            <h3>${escapar(p.titulo)}</h3>
            <p>${escapar(resumo(p.corpo))}</p>
            <span class="ler">Ler explicação</span>
          </div>
        </button>`).join("");

    document.querySelectorAll(".post").forEach(botao => {
      botao.onclick = () => {
        const p = posts[botao.dataset.i];
        abrir(`<article class="leitura">
          <small>${escapar([p.serie, p.autor, p.data].filter(Boolean).join(" · "))}</small>
          <h1>${escapar(p.titulo)}</h1>
          ${window.marked ? htmlSeguro(marked.parse(p.corpo)) : p.corpo.split(/\n\n+/).map(par => `<p>${escapar(par)}</p>`).join("")}
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
      .filter(a => /^[\w.-]+\.md$/.test(a.name))
      .sort((a, b) => b.name.localeCompare(a.name))   // mais novos primeiro
      .map(a => fetch(`${PASTA_BLOG}/${a.name}`).then(r => r.text()).then(t => lerPost(t, a.name)))
  ))
  .then(posts => mostrarFeed([...posts, ...POSTS_EXEMPLO]))
  .catch(() => mostrarFeed(POSTS_EXEMPLO));
