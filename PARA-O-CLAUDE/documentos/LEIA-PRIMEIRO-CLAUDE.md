# LEIA PRIMEIRO — sistema de vídeos Shopee

Este projeto é uma cópia limpa do sistema de vídeos Shopee do grupo, já adaptada para quem instalou.
Tudo o que é desta conta está em **`conta.json`** (raiz do projeto), preenchido pelo `1-INSTALAR.bat`:

- `nome` — dono da conta e deste PC (chamar pelo nome).
- `nicho` — só garimpar produtos desse nicho.
- `voz.id` — voz do ElevenLabs desta conta (vai no campo `voz` de cada JSON).
- `videosPorDia` e `janela` — quantos vídeos e entre que horários distribuir.
- `corDestaque` e `hashtagFixa` — identidade visual e hashtag de todas as legendas.
- `paginas` — links das páginas Oportunidades e Postagens do Dia (vazio = criar na primeira vez e gravar o link aqui).

Critérios de garimpo (preço, comissão, nota, vendas, estoque): `scripts/oportunidades/config-pontuacao.json`.
Pasta do Drive e versão Instagram: `scripts/v2/config.json`.

## Para as contas do grupo não competirem nem parecerem conteúdo repetido
1. **Voz própria**: a diretriz de IA da Shopee pede para não usar o mesmo "apresentador de IA" em várias contas. O instalador bloqueia as vozes já usadas no grupo (lista `VOZES_EM_USO` em `scripts/instalar/instalar.mjs`).
2. **Nicho próprio**, combinado com o grupo, mantendo Comissão Xtra obrigatória.
3. **Músicas próprias**: a pasta vem vazia; `checar-musicas.mjs` recusa faixas que outra conta do grupo já usa.
4. Cores e ganchos com estilo próprio.

## O que vem vazio (de propósito)
`produtos/`, `public/produtos/`, `public/musicas/` (o Claude monta a biblioteca própria da conta na primeira leva), `VIDEOS-PRONTOS/`, `VIDEOS-ARQUIVO/`, `VIDEOS-INSTAGRAM/`, `legendas/`, `logs/`, `out/`, `_BACKUPS/`, `_desativados/`.
A chave do ElevenLabs fica em `CHAVE-ELEVENLABS.txt` (fora do git): nunca ler, mostrar ou pedir no chat.

## Ordem
A produção segue `como-produzir-leva.md`, `criterios-garimpo.md`, `diretrizes-shopee-video.md` e `plano-automacao.md`.
