---
name: "leva-shopee-videos"
description: "Produzir uma leva de vídeos Shopee Vídeos no projeto Remotion do usuário (nicho em conta.json): garimpo, mídias, roteiros, JSONs, prévias e agenda."
---

# Leva de vídeos Shopee Vídeos

Use quando o usuário pedir uma nova leva (ex.: "faz os 30 vídeos de amanhã", "garimpa mais produtos", "/leva-shopee-videos 30 23/10").

## Antes de começar
1. Ler `conta.json` na raiz do projeto: nome do dono, nicho, voz, vídeos por dia, janela de horários, cor de destaque e links das páginas.
   Se `instalado` for `false`, pedir para rodar o `1-INSTALAR.bat` primeiro.
2. Ler os documentos (em `PARA-O-CLAUDE/documentos/` ou no projeto do Claude):
   - `como-produzir-leva.md` — passo a passo técnico completo (seguir à risca)
   - `diretrizes-shopee-video.md` — regras da Shopee (prioridade máxima)
   - `criterios-garimpo.md` — critérios de produto, horários e custos
   - `acompanhamento-conta.md` — situação da conta (se existir; criar quando houver o que registrar)
3. Confirmar quantidade e data só se o pedido não disser (padrão: `videosPorDia` de `conta.json`, dentro da `janela`, dia seguinte).
4. Se o trabalho for na nuvem, copiar as ferramentas de `scripts/ferramentas-claude/` do projeto para lá.
5. Músicas: rodar `node scripts/ferramentas-claude/checar-musicas.mjs`. Pasta vazia ou pequena = montar a biblioteca primeiro (skill `videos-shopee`, seção "Músicas").

## Regras que nunca mudam
- Falar sempre em português com o dono da conta (chamar pelo nome de `conta.json`).
- Render final só no PC dele, rodado por ele. Nada de controlar a tela.
- Consultas à Shopee em ritmo humano (10–20 s entre chamadas); downloads só em poucos .zip.
- Revisar visualmente cada produto: sem rosto, criança, álcool, marca d'água de outras plataformas, personagem protegido, promoção/preço; b-roll só se mostrar o próprio produto em uso.
- Produtos só do nicho de `conta.json`.
- Roteiros de 250–290 caracteres, PT-BR casual, honestos, com a voz de `conta.json` (`voz.id`). Se a voz estiver vazia, pedir para escolher antes de entregar.

## Fim da leva
Dizer ao dono: rodar `FAZER-TUDO.bat` (ou deixar o agendamento da madrugada), conferir `VIDEOS-PRONTOS\ULTIMA-EXECUCAO.txt`, postar pela pasta `VIDEOS-PRONTOS\DD-MM-AAAA` com o `00-POSTAGEM.txt` e importar o .ics.
