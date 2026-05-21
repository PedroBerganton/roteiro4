# Roteiro 4

- Pedro Berganton

## Objetivo

Este projeto é uma extensão para Firefox que detecta sinais de rastreamento em paginas web. A extensão analisa a pagina acessada e mostra ao usuário informações sobre domínios externos, cookies armazenamento local e uma nota final chamada **Privacy Score**.

A extensão não bloqueia requisições. Ela apenas detecta e apresenta os dados encontrados de forma simples.

## Estrutura do projeto

```txt
ROTEIRO 4/
├── manifest.json
├── monitoramento.js
├── pagina.js
├── painel.html
├── painel.css
└── painel.js
```

- `manifest.json`:configura a extensão e define as permissões usadas.
- `monitoramento.js`: roda em segundo plano e observa as requisições feitas pela página.
- `pagina.js`: roda dentro da página e verifica localStorage, sessionStorage e IndexedDB.
- `painel.html`: estrutura visual do popup.
- `painel.css`: estilo do  popup.
- `painel.js`: monta o relatório, classifica cookies e calcula o Privacy Score.

## Funcionalidades implementadas

A extensão implementa:

- detecção de dominios de terceira parte;
- identificação do tipo de recurso carregado, como `script`, `image`, `font`, `beacon` e `xmlhttprequest`;
- listagem de cookies da página;
- classificação dos cookies em primeira parte ou terceira parte;
- classificação dos cookies em sessão ou persistentes;
- detecção de uso de localStorage sessionStorage e IndexedDB;
- identificação simples de scripts suspeitos por palavras-chave;
- cálculo do Privacy Score.

## Metodologia do Privacy Score

A pontuação começa em **100 pontos** e perde pontos conforme a página apresenta sinais associados a rastreamento.

| Critério detectado | Penalidade |
|---|---:|
| Requisição para domínio de terceira parte | -2 |
| Script suspeito | -5 |
| Cookie de terceira parte | -3 |
| Cookie persistente | -2 |
| Uso de localStorage | -5 |
| Uso de sessionStorage | -2 |
| Uso de IndexedDB | -5 |

Classificação:

| Pontuação | Resultado |
|---:|---|
| 80 a 100 | Boa privacidade |
| 60 a 79 | Atenção moderada |
| 40 a 59 | Risco elevado |
| 0 a 39 | Privacidade ruim |

## Testes realizados

A extensão foi testada em diferentes sites para comparar comportamentos de rastreamento.

| Site | Privacy Score | Resultado observado |
|---|---:|---|
| UOL | 0 | Foram encontrados varios cookies persistentes e uso de Web Storage. Neste teste, a pontuação ficou baixa principalmente pela quantidade de cookies e armazenamento detectados. |
| YouTube | 76 | Foram encontrados cookies persistentes e uso de Web Storage, mas poucos domínios externos no teste realizado. |
| Google | 85 | A pagina inicial apresentou poucos sinais de rastreamento no teste, com cookies persistentes e uso de Web Storage, mas sem domínios externos detectados no momento da análise. |

O resultado varia de acordo com o comportamento de cada site no momento do carregamento. Sites de noticia, como UOL, costumam carregar mais recursos relacionados a anúncios, métricas, consentimento de cookies e análise de audiência, o que reduz o Privacy Score.

No YouTube, a extensão encontrou cookies persistentes e armazenamento local, mas no teste mostrado foram detectados poucos domínios externos, resultando em uma pontuação intermediária. No Google, a página inicial apresentou menos elementos externos no momento da análise, por isso recebeu uma pontuação mais alta.

Esses testes mostram que o Privacy Score não é fixo: ele muda conforme os recursos carregados pela página, os cookies existentes, o uso de armazenamento local, o cache do navegador e o momento em que o popup da extensão é aberto.

## Como instalar

1. Abrir o Firefox.
2. Acessar `about:debugging`.
3. Clicar em **Este Firefox**.
4. Clicar em **Carregar extensão temporária**.
5. Selecionar o arquivo `manifest.json`.
6. Abrir um site, esperar carregar e clicar no ícone da extensão.

## Conclusão

O Detector de Privacidade permite visualizar de forma simples e direta alguns sinais de rastreamento presentes durante a navegação web.

A extensão identifica domínios de terceira parte, tipos de recursos carregados, cookies, armazenamento local e scripts potencialmente associados a rastreamento. Com esses dados, ela calcula um Privacy Score que ajuda o usuario a comparar o comportamento de diferentes sites.

Nos testes realizados, paginas com mais anúncios, cookies persistentes e conexões externas receberam pontuações mais baixas, enquanto páginas com menos recursos externos apresentaram pontuações mais altas. Assim, o projeto cumpre o objetivo de apresentar ao usuário uma visão clara sobre possíveis impactos à privacidade durante o carregamento de páginas web.