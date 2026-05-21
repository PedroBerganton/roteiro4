const dadosPorAba = {};

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

function criarDadosDaAba(idAba) {
  if (!dadosPorAba[idAba]) {

    dadosPorAba[idAba] = {


      urlPagina: "",
      dominioPagina: "",
      requisicoesExternas: [],
      scriptsSuspeitos: [],
      armazenamento: {
        localStorage: [],
        sessionStorage: [],
        indexedDB: []
      }


    };
  }
  return dadosPorAba[idAba];
}

browser.tabs.onUpdated.addListener((idAba, mudanca, aba) => {

  if (mudanca.status === "loading" && aba.url) {

    const dados = criarDadosDaAba(idAba);

    dados.urlPagina = aba.url;

    dados.dominioPagina = pegarDominioPrincipal(pegarHost(aba.url));

    dados.requisicoesExternas = [];

    dados.scriptsSuspeitos = [];

    dados.armazenamento = {

      localStorage: [],
      sessionStorage: [],
      indexedDB: []

    };
  }
});

browser.webRequest.onBeforeRequest.addListener(
  detalhes => {
    if (detalhes.tabId < 0) {
      return;
    }
    const dados = criarDadosDaAba(detalhes.tabId);
    const hostRequisicao = pegarHost(detalhes.url);
    const dominioRequisicao = pegarDominioPrincipal(hostRequisicao);
    const ehRequisicaoExterna =
      dados.dominioPagina &&
      dominioRequisicao &&
      dominioRequisicao !== dados.dominioPagina;
    if (ehRequisicaoExterna) {
      dados.requisicoesExternas.push({
        dominio: hostRequisicao,
        url: detalhes.url,
        tipo: detalhes.type
      });
    }
    const pareceScriptSuspeito = /track|analytics|ads|doubleclick|pixel|tag|beacon/i.test(
      detalhes.url
    );
    if (detalhes.type === "script" && pareceScriptSuspeito) {
      dados.scriptsSuspeitos.push({
        url: detalhes.url,
        motivo: "Script com nome associado a rastreamento ou anúncios"
      });
    }
  },
  {
    urls: ["<all_urls>"]
  }
);
browser.runtime.onMessage.addListener((mensagem, remetente) => {
  const idAba = remetente.tab ? remetente.tab.id : mensagem.idAba;
  const dados = criarDadosDaAba(idAba);

  if (mensagem.tipo === "dados-armazenamento") {
    dados.armazenamento = mensagem.armazenamento;
  }
  if (mensagem.tipo === "pedir-relatorio") {
    return Promise.resolve(dados);
  }
});