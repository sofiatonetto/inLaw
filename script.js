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

// Encontros: data (ano-mês-dia) e tema.
// O dia da semana, o semestre e o "próximo encontro" são calculados sozinhos.
const ENCONTROS = [
  { data: "2026-03-12", tema: "Abertura: o que é inovação no Direito?" },
  { data: "2026-04-09", tema: "Inteligência artificial nos tribunais" },
  { data: "2026-05-07", tema: "LGPD e proteção de dados" },
  { data: "2026-06-11", tema: "LawTechs e LegalTechs" },
  { data: "2026-08-17", tema: "As profissões do futuro" },
  { data: "2026-09-14", tema: "Marketing jurídico e redes sociais" },
  { data: "2026-10-19", tema: "Contratos inteligentes" },
  { data: "2026-11-09", tema: "Tema a definir" },
];

// Senha da área do professor (padrão: inlaw2026).
// Para trocar: abra o site, aperte F12 > Console, digite gerarHash("nova-senha")
// e cole aqui o código que aparecer.
const HASH_SENHA = "2728e8ede69eded5f5930e935f6fec08617d9659772642ecd39d2554d62dbfed";

// Fotos usadas na galeria se o site não conseguir ler o GitHub
const FOTOS_PADRAO = [
  "ii-inlaw-experience.jpg",
  "encontro-do-grupo.jpg",
  "manual-ia-generativa.jpg",
  "escola-padre-rafael-iop.jpg",
  "educar-para-transformar.jpg",
  "visita-escola-vale-veneto.jpg",
];

// Posts de exemplo do blog (aparecem enquanto a pasta blog/ estiver vazia)
const POSTS_EXEMPLO = [
  { titulo: "Coordenador de Proteção de Dados", serie: "As Profissões do Futuro!", autor: "InLaw", data: "", capa: "",
    corpo: "O **DPO** (Data Protection Officer) é quem garante que uma empresa trate os dados pessoais de acordo com a LGPD.\n\nTexto completo em breve." },
  { titulo: "LawTechs - LegalTechs", serie: "As Profissões do Futuro!", autor: "InLaw", data: "", capa: "",
    corpo: "Empresas que usam tecnologia para resolver problemas jurídicos: automação de documentos, jurimetria, gestão de processos e muito mais.\n\nTexto completo em breve." },
  { titulo: "Marketing Jurídico", serie: "As Profissões do Futuro!", autor: "InLaw", data: "", capa: "",
    corpo: "Como advogados e escritórios podem se comunicar nas redes respeitando as regras da OAB.\n\nTexto completo em breve." },
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
          <div class="tema">${e.tema}</div>
          <button class="abrir-chamada" data-data="${e.data}">Chamada<small>${contarPresentes(e.data)} presentes</small></button>
        </div>`;
  };

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
// Obs.: a senha afasta visitantes comuns, mas não é um login de verdade.
async function sha256(texto) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
  return [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2, "0")).join("");
}
window.gerarHash = async texto => { const h = await sha256(texto); console.log(h); return h; };

function modoProfessor(ligar) {
  document.body.classList.toggle("prof", ligar);
  try { ligar ? sessionStorage.setItem("inlaw-prof", "1") : sessionStorage.removeItem("inlaw-prof"); } catch {}
  atualizarBotaoProf();
  desenharCalendarios();
}

function atualizarBotaoProf() {
  const botao = $("btn-prof");
  const logado = document.body.classList.contains("prof");
  botao.textContent = logado ? "Sair da área do professor" : "Área do professor";
  botao.onclick = logado ? () => modoProfessor(false) : pedirSenha;
}

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
    if (await sha256($("senha").value) !== HASH_SENHA) {
      $("erro-login").textContent = "Senha incorreta.";
      return;
    }
    modal.close();
    modoProfessor(true);
    $("encontros").scrollIntoView({ behavior: "smooth" });
  };
}


// ---------- Chamada ----------
// As presenças ficam salvas neste aparelho/navegador. Exporte a planilha ao fim de cada encontro.
const CHAVE_CHAMADAS = "inlaw-chamadas";
const lerChamadas = () => lerJSON(CHAVE_CHAMADAS, {});
const salvarChamadas = chamadas => salvarJSON(CHAVE_CHAMADAS, chamadas);
const contarPresentes = data => (lerChamadas()[data] || []).length;

function abrirChamada(data) {
  abrir(`
    <div class="chamada">
      <h1>Chamada · ${dataBR(data)}</h1>
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

  function mostrarLista() {
    const presentes = lerChamadas()[data] || [];
    $("c-total").textContent = presentes.length;
    $("c-lista").innerHTML = presentes.map((p, i) => `
      <tr>
        <td>${i + 1}</td><td>${escapar(p.nome)}</td><td>${escapar(p.ra)}</td><td>${p.hora}</td>
        <td><button aria-label="Remover ${escapar(p.nome)}" data-i="${i}">×</button></td>
      </tr>`).join("");

    document.querySelectorAll("#c-lista button").forEach(botao => {
      botao.onclick = () => {
        const pessoa = presentes[botao.dataset.i];
        if (removerQuem !== pessoa.ra) {
          removerQuem = pessoa.ra;
          aviso.textContent = `Clique no × de novo para remover ${pessoa.nome}.`;
          return;
        }
        const chamadas = lerChamadas();
        chamadas[data].splice(botao.dataset.i, 1);
        salvarChamadas(chamadas);
        removerQuem = null;
        aviso.textContent = "";
        mostrarLista();
      };
    });
  }

  $("form-chamada").onsubmit = ev => {
    ev.preventDefault();
    const nome = campoNome.value.trim().replace(/\s+/g, " ");
    const ra = campoRA.value.trim();
    if (!nome || !ra) return;

    const chamadas = lerChamadas();
    chamadas[data] ||= [];
    if (chamadas[data].some(p => p.ra === ra)) {
      aviso.textContent = `O RA ${ra} já está na chamada deste encontro.`;
      return;
    }
    const hora = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    chamadas[data].push({ nome, ra, hora });
    salvarChamadas(chamadas);

    aviso.textContent = "";
    campoNome.value = "";
    campoRA.value = "";
    campoNome.focus();
    mostrarLista();
  };

  $("c-exportar").onclick = () => exportarPlanilha([data]);
  $("c-exportar-todos").onclick = () => exportarPlanilha(Object.keys(lerChamadas()).sort());
  modal.addEventListener("close", desenharCalendarios, { once: true });   // atualiza o nº de presentes

  mostrarLista();
  campoNome.focus();
}

// Gera a planilha .csv (separada por ; e com acentos certos para abrir direto no Excel)
function exportarPlanilha(datas) {
  const chamadas = lerChamadas();
  const celula = v => `"${String(v).replace(/"/g, '""')}"`;
  const linha = valores => valores.map(celula).join(";");

  const linhas = [linha(["Data do encontro", "Nº", "Nome", "RA", "Horário da resposta"])];
  datas.forEach(data => {
    const presentes = chamadas[data] || [];
    presentes.forEach((p, i) => linhas.push(linha([dataBR(data), i + 1, p.nome, p.ra, p.hora])));
    linhas.push(linha([dataBR(data), "", "TOTAL DE PRESENTES", presentes.length, ""]));
    linhas.push("");
  });

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

// Ao carregar: continua logado se o professor já entrou nesta aba
try { if (sessionStorage.getItem("inlaw-prof") === "1") document.body.classList.add("prof"); } catch {}
atualizarBotaoProf();
desenharCalendarios();


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
  .then(posts => mostrarFeed(posts.length ? posts : POSTS_EXEMPLO))
  .catch(() => mostrarFeed(POSTS_EXEMPLO));
