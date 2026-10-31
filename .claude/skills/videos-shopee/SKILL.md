---
name: "videos-shopee"
description: "Garimpar produtos no painel de afiliado da Shopee (Comissão Xtra), coletar fotos e vídeos, montar roteiros e JSONs e preparar a leva de vídeos verticais do sistema Remotion no PC do usuário."
---

# Vídeos Shopee — garimpo, coleta de material e edição

Use quando o usuário pedir uma leva de vídeos ("faz os 30 vídeos de amanhã", "garimpa produtos", "/videos-shopee 30 25/10"), ajustes em vídeos já montados ou a coleta de material de produtos da Shopee.

## 0. Antes de tudo
- Ler `conta.json` (dono, nicho, voz, vídeos por dia, janela de horários, cor, páginas). Se `instalado` for `false`, pedir para rodar o `1-INSTALAR.bat`.
- Ler os documentos (`PARA-O-CLAUDE/documentos/` ou o projeto do Claude): `diretrizes-shopee-video.md` (prioridade máxima), `criterios-garimpo.md`, `como-produzir-leva.md`, `plano-automacao.md` e `LEIA-PRIMEIRO-CLAUDE.md`.
- Pedir acesso às pastas do PC: a pasta do projeto e a pasta Downloads. Falar sempre em português.
- Regras fixas: render final só no PC do usuário (FAZER-TUDO.bat); nunca controlar a tela; nunca ler ou mostrar a chave do ElevenLabs; ritmo humano na Shopee (10–20 s entre consultas); se aparecer verificação/captcha, parar.

## 1. Garimpo (coleta de produtos)
Na aba `https://affiliate.shopee.com.br` (navegador do app, logado na conta de afiliado do usuário):
- Lista com Comissão Xtra: `fetch('/api/v3/offer/product/list?list_type=7&sort_type=1&page_offset=0&page_limit=50&client_type=1')`.
- Busca por tema: a mesma URL com `&keyword=<palavras>`; manter só itens com `seller_commission_rate` > 0. Usar palavras do nicho de `conta.json`.
- Cada item traz em `batch_item_for_item_card_full`: itemid, shopid, name, catid, ctime (idade), stock, sold, historical_sold, cmt_count, item_rating.rating_star, price (÷100000), images, tier_variations (nomes e imagens das variações), video_info_list (URL do vídeo do vendedor), shop_name. `long_link` = link de afiliado.
- Filtrar com `scripts/oportunidades/config-pontuacao.json` (preço, comissão mínima, nota, vendas e estoque definidos na instalação), nicho de `conta.json`, produto ainda não usado (comparar itemId e nome com `produtos/*.json` e `VIDEOS-PRONTOS`). Priorizar anúncio recente que já vende. Separar ~20% de reservas.
- Página de aprovação (Oportunidades): link em `conta.json` → `paginas.oportunidades`. Se vazio, criar a página na primeira rodada e gravar o link lá.
- Não abrir shopee.com.br (dispara captcha).

## 1b. Músicas (biblioteca própria da conta)
O kit vem sem músicas: cada conta tem a sua, para não soar igual às outras contas do grupo.
- Rodar `node scripts/ferramentas-claude/checar-musicas.mjs`. Se a pasta estiver vazia ou pequena (menos de 10 faixas), montar a biblioteca **antes** dos JSONs: 15–20 faixas em `public/musicas/`.
- Fonte: Pixabay Music (`pixabay.com/music`), cuja licença permite uso comercial sem atribuição. Outra fonte só se a licença liberar uso comercial em redes sociais. Nunca música de artista/gravadora nem "grátis" sem licença clara.
- Estilos variados para casar com os produtos: animada, feliz, lofi, acustica, ukulele, bossa, corporativa e, na época, natal. Instrumental (sem voz cantada, para não brigar com a narração), alegre e leve, com 30 s ou mais (o vídeo usa a faixa em loop com fade).
- Baixar pelo navegador do app, em ritmo humano. Se o site pedir login ou verificação, parar e entregar ao dono uma lista de links para ele mesmo baixar; depois mover os arquivos de Downloads para `public/musicas/`.
- Nome do arquivo: `<estilo>-<n>.mp3` (ex.: `lofi-2.mp3`). Registrar cada faixa em `public/musicas/CREDITOS.txt`: arquivo | título | autor | link | licença | data.
- Rodar o `checar-musicas.mjs` de novo: faixa recusada por "já usada em outra conta do grupo" deve ser apagada e trocada.
- Nos JSONs, `musica` só aponta para faixas que existem nessa pasta (`musicas/<arquivo>`).

## 2. Coleta de mídia
- Fotos: `https://down-br.img.susercontent.com/file/<id da imagem>`; vídeo: URL de `video_info_list`.
- Baixar dentro da aba do painel e juntar em poucos .zip (função `_pack` de `scripts/ferramentas-claude/garimpo-navegador.js`), ~10–12 produtos por arquivo. Nunca centenas de downloads soltos (trava o PC).
- No PC: o zip pode chegar como `.tmp` em Downloads. Extrair em `public/produtos/<slug>/` (slug único; se existir, `-2`) e mover o zip para `Downloads/_Shopee-Videos-ja-usados`.

## 3. Revisão do material (obrigatória, produto por produto)
- Prancha com todas as fotos + 8 frames do vídeo (`prancha.py`) e conferência ampliada.
- Detector de rosto (OpenCV FaceDetectorYN + YuNet) no vídeo a cada 0,5 s → usar só trechos sem rosto.
- Descartar: rosto, criança, álcool, cigarro, marca d'água (plataforma, vendedor, fábrica — texto clarinho no meio ou canto), selo de promoção/preço, print de página, produto diferente do anúncio, cena com outra ferramenta fazendo o trabalho, foto < 500 px. Menos de 4 imagens limpas → trocar o produto. Não apagar marca d'água; recortar parte limpa é ok.

## 4. Edição (montagem do vídeo)
- Recorte do produto para capa "estúdio" quando ficar bom (`recortar.py`, rembg isnet; FR=0.99 mantém só o maior objeto).
- Um JSON por produto em `produtos/<slug>.json` (modelos: `produtos/_arquivados/exemplo.json` e `gerar-lote-modelo.py`): slug, postar (AAAA-MM-DD), horario (distribuído na `janela` de `conta.json`), corDestaque (padrão de `conta.json`, pode variar), musica, volumeMusica 0.12, narracao `produtos/<slug>/narracao.mp3`, voz (`conta.json` → `voz.id`), produtoNome (nome exato do anúncio), itemId, lojaId, lojaNome, termoBusca (4–5 palavras), nomeProduto, gancho (≤ 34 caracteres + emoji), roteiro (230–290 caracteres, PT-BR casual, honesto, sem preço, avisa variação confusa, termina chamando para o carrinho), cta, legenda (≤ 150 com hashtags genéricas + `hashtagFixa` de `conta.json`), capa, midias (4–6 cenas de 2,2–2,8 s; vídeo quadrado/horizontal com ajuste "inteira"; `inicio + duracao×1,4` dentro do trecho limpo), ganchoMidia opcional, zoomAlternado.
- Layout do Remotion: capa pronta no frame 0, tela cheia, texto em faixa própria sobre degradê, infográfico aparece inteiro.
- Prévias na nuvem (`previas.mjs`: frames 0, 100, 45%, 70%, final) e conferência de cada vídeo.

## 5. Entrega
- Salvar JSONs e imagens novas no PC e conferir que todos os arquivos citados existem; rodar `checar-repetidos.py <data>`; commit no git.
- Criar os eventos de postagem no Google Agenda (se conectado) ou gerar um .ics: 10 min, alarme na hora, arquivo, termo de busca, loja, link, legenda e lembrete do rótulo de IA.
- Página "Postagens do Dia": link em `conta.json` → `paginas.postagensDoDia` (vazio = criar e gravar o link).
- Dizer ao usuário: rodar `FAZER-TUDO.bat` (ou deixar o agendamento), conferir `VIDEOS-PRONTOS/ULTIMA-EXECUCAO.txt` e postar pela pasta do dia com o `00-POSTAGEM.txt`. Ao postar: rótulo de IA ligado e "Permitir reutilização do conteúdo" desligado.
