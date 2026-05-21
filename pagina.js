function lerStorage(storage) {
  const itens = [];

  try {
    for (let i = 0; i < storage.length; i++) {
      const chave = storage.key(i);
      const valor = storage.getItem(chave);



      itens.push({
        chave: chave,
        tamanho: valor ? valor.length : 0
      });
    }
  } catch (erro) {
    itens.push({
      chave: "Não foi possível acessar este storage",
      tamanho: 0
    });
  }


  return itens;
}

async function lerIndexedDB() {
  if (!indexedDB.databases) {

    return [];
  }

  try {
    const bancos = await indexedDB.databases();

    return bancos.map(banco => ({

      nome: banco.name || "sem nome",
      versao: banco.version || "desconhecida"
    }));
  } catch (erro) {
    return [];
  }
}

async function enviarDadosDeArmazenamento() {

  const armazenamento = {
    localStorage: lerStorage(localStorage),
    sessionStorage: lerStorage(sessionStorage),
    indexedDB: await lerIndexedDB()

  };

  browser.runtime.sendMessage({
    tipo: "dados-armazenamento",

    armazenamento: armazenamento
  });
}



enviarDadosDeArmazenamento();