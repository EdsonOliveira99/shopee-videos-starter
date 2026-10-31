# Sistema de vídeos Shopee (Remotion)

Gera vídeos verticais 1080x1920 para o Shopee Vídeos: cada `produtos/<slug>.json` vira um vídeo.

## Antes de qualquer coisa
- Ler `conta.json`: dono da conta, nicho, voz, vídeos por dia, janela de horários, cor e links das páginas.
  `instalado: false` = pedir para rodar o `1-INSTALAR.bat` antes.
- Ler `PARA-O-CLAUDE/documentos/` (começar por `LEIA-PRIMEIRO-CLAUDE.md`). As regras da Shopee (`diretrizes-shopee-video.md`) têm prioridade máxima.
- Para produzir levas, usar as skills de `.claude/skills/` (`videos-shopee` e `leva-shopee-videos`).
- Falar sempre em português.

## Nunca
- Ler, mostrar ou pedir a chave do ElevenLabs (`CHAVE-ELEVENLABS.txt`).
- Renderizar o vídeo final fora do PC do dono ou controlar a tela dele.
- Abrir shopee.com.br (captcha). Garimpo só pelo painel de afiliado, em ritmo humano.

## Mapa
- `src/` — layout e animação (Remotion). `schema.ts` documenta cada campo do JSON. Exemplo: `produtos/_arquivados/exemplo.json`.
- `scripts/v2/fazer-tudo.mjs` — narração → render → conferência → Drive → limpeza (é o `FAZER-TUDO.bat`).
- `scripts/gerar-narracoes.mjs`, `scripts/render-todos.mjs` — etapas avulsas.
- `scripts/oportunidades/` — coleta e pontuação de produtos (`config-pontuacao.json` = critérios da conta).
- `scripts/ferramentas-claude/` — ferramentas das levas (prancha, recorte, prévias, repetidos, `checar-musicas.mjs`).
- `public/musicas/` — biblioteca própria da conta (vem vazia; o Claude monta na primeira leva, com créditos em `CREDITOS.txt`).
- `scripts/instalar/instalar.mjs` — perguntas da instalação (`VOZES_EM_USO` = vozes que já têm dono no grupo).
- Saída: `VIDEOS-PRONTOS/DD-MM-AAAA/N-HHhMM-slug.mp4` + `.txt` da legenda + `00-POSTAGEM.txt`.

## Segurança
Commit no git antes de mudar código e ao fim de cada leva. `VOLTAR-VERSAO-ESTAVEL.bat` restaura o código do dia da instalação.
