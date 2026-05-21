async function pegarAbaAtual() {
  const abas = await browser.tabs.query({
    active: true,
    currentWindow: true
  });
  return abas[0];
}
function pegarHost(url) {
  try {
    return new URL(url).hostname;
  } catch (erro) {
    return "";
  }
}
function pegarDominioPrincipal(host) {
  const partes = host.split(".");


  if (partes.length <= 2) {

    return host;
  }


  return partes.slice(-2).join(".");
}

async function pegarCookiesDaAba(aba) {

  const cookies = await browser.cookies.getAll({

    url: aba.url
  });

  const dominioDaPagina = pegarDominioPrincipal(pegarHost(aba.url));

  return cookies.map(cookie => {

    const dominioCookie = cookie.domain.replace(/^\./, "");

    const dominioPrincipalCookie = pegarDominioPrincipal(dominioCookie);

    const origem =

      dominioPrincipalCookie === dominioDaPagina

        ? "primeira parte"
        : "terceira parte";

    const duracao = cookie.session ? "sessão" : "persistente";

    return {
      nome: cookie.name,
      dominio: cookie.domain,
      origem: origem,
      duracao: duracao

    };

  });

}

function calcularNotaPrivacidade(relatorio, cookies) {
  let nota = 100;

  nota -= relatorio.requisicoesExternas.length * 2;
  nota -= relatorio.scriptsSuspeitos.length * 5;

  const cookiesTerceiros = cookies.filter(cookie => cookie.origem === "terceira parte");

  const cookiesPersistentes = cookies.filter(cookie => cookie.duracao === "persistente");

  nota -= cookiesTerceiros.length * 3;
  nota -= cookiesPersistentes.length * 2;

  if (relatorio.armazenamento.localStorage.length > 0) {
    nota -= 5;
  }

  if (relatorio.armazenamento.sessionStorage.length > 0) {
    nota -= 2;
  }

  if (relatorio.armazenamento.indexedDB.length > 0) {
    nota -= 5;
  }



  if (nota < 0) {
    nota = 0;
  }

  return nota;
}

function classificarNota(nota) {
  if (nota >= 80) {

    return "Boa privacidade";
  }

  if (nota >= 60) {
    return "Atenção moderada";
  }

  if (nota >= 40) {

    return "Risco elevado";
  }

  return "Privacidade ruim";
}

function adicionarItemNaLista(idLista, texto) {
  const lista = document.getElementById(idLista);
  const item = document.createElement("li");

  item.textContent = texto;

  lista.appendChild(item);
}

function limparLista(idLista) {
  document.getElementById(idLista).innerHTML = "";
}

function mostrarMensagemSeVazio(idLista, mensagem) {
  const lista = document.getElementById(idLista);

  if (lista.children.length === 0) {
    const item = document.createElement("li");
    item.textContent = mensagem;

    lista.appendChild(item);
  }
}

async function carregarRelatorio() {
  try {
    const aba = await pegarAbaAtual();

    const relatorio = await browser.runtime.sendMessage({
      tipo: "pedir-relatorio",
      idAba: aba.id
    });

    const cookies = await pegarCookiesDaAba(aba);
    const nota = calcularNotaPrivacidade(relatorio, cookies);

    document.getElementById("score").textContent = nota;
    document.getElementById("classification").textContent = classificarNota(nota);

    limparLista("third-party-list");

    limparLista("cookies-list");
    limparLista("scripts-list");

    relatorio.requisicoesExternas.forEach(requisicao => {
      adicionarItemNaLista(
        "third-party-list",

        `${requisicao.dominio} — ${requisicao.tipo}`
      );
    });

    cookies.forEach(cookie => {
      adicionarItemNaLista(
        "cookies-list",
        `${cookie.nome} | ${cookie.dominio} | ${cookie.origem} | ${cookie.duracao}`
      );
    });

    document.getElementById("storage").textContent = JSON.stringify(
      relatorio.armazenamento,
      null,
      2
    );

    relatorio.scriptsSuspeitos.forEach(script => {
      adicionarItemNaLista(
        
        "scripts-list",
        `${script.motivo}: ${script.url}`
      );
    });

    mostrarMensagemSeVazio(
      "third-party-list",
      "Nenhum domínio externo detectado até o momento."
    );

    mostrarMensagemSeVazio(
      "cookies-list",
      "Nenhum cookie encontrado para esta página."
    );

    mostrarMensagemSeVazio(
      "scripts-list",
      "Nenhum script suspeito detectado."
    );
  } catch (erro) {
    document.getElementById("score").textContent = "Erro";
    document.getElementById("classification").textContent =
      "Não foi possível carregar o relatório.";

    document.getElementById("storage").textContent = erro.message;
  }
}

carregarRelatorio();