# Como produzir uma leva de vídeos (passo a passo para o Claude)

Ler antes: conta.json (raiz do projeto), diretrizes-shopee-video.md, criterios-garimpo.md, plano-automacao.md.

## Ambiente
- Projeto no PC: a pasta onde está o `conta.json`. Downloads: `%USERPROFILE%\Downloads`, subpasta `_Shopee-Videos-ja-usados`. Pedir as duas pastas (e permissão de exclusão na Remotion, por causa do git) no início.
- Render sempre no PC do dono (`FAZER-TUDO.bat`, manual ou agendado 04:00). Nunca renderizar vídeo final na nuvem; nunca controlar a tela. Prévias de imagem na nuvem são ok.
- Narração: o FAZER-TUDO gera (campo `roteiro` de cada JSON). Nunca ler/mostrar a chave do ElevenLabs.
- O shell do PC não tem internet. Downloads só pelo navegador (aba do painel de afiliado), juntados em .zip.
- Ferramentas em `scripts\ferramentas-claude\`. Na nuvem: `pip install rembg[cpu] scipy opencv-python-headless`; detector de rosto YuNet; projeto copiado para a nuvem + `npm ci` para prévias (narração muda de ~18,5 s para o calculateMetadata).

## Passo a passo
0. Músicas: `node scripts/ferramentas-claude/checar-musicas.mjs`. Vazia ou < 10 faixas → montar a biblioteca da conta antes (skill videos-shopee, seção "Músicas").
1. Garimpo no painel de afiliado (list_type=7 + buscas por palavras do nicho de conta.json, filtrar Comissão Xtra). Excluir produtos já usados (itemId e nome).
2. Detalhes vêm no item do painel (`batch_item_for_item_card_full`: images, tier_variations, video_info_list, shop_name, ctime, stock, item_rating). Separar ~20% de reservas.
3. Download em .zip (`_pack` do garimpo-navegador.js), ~10–12 produtos por parte. O arquivo pode chegar como .tmp em Downloads — é o zip. Extrair em `public\produtos`, mover o zip para `_Shopee-Videos-ja-usados`. Slug sempre único (se existir, usar -2, -3).
4. Revisão visual de cada produto (prancha.py + detector de rosto): descartar rosto, criança, álcool, marca d'água (inclusive logo do vendedor), promoção, produto diferente, fotos < 500 px, menos de 4 imagens limpas.
5. Capa: foto inteira do produto sem texto cortado (ou frame limpo, ou recorte).
6. JSONs (modelo em gerar-lote-modelo.py): slug, postar, horario (janela de conta.json), corDestaque, volumeMusica, narracao, voz (conta.json), musica, produtoNome, itemId, lojaId, lojaNome, termoBusca, nomeProduto, gancho ≤ 34, roteiro, cta, legenda ≤ 150, capa, midias 4–6, zoomAlternado, ganchoMidia opcional. `inicio + duracao×1,4` dentro da parte segura do vídeo.
7. Prévias (previas.mjs) e conferência.
8. Entregar JSONs/imagens no PC; conferir que todos os arquivos existem; git commit.
9. Agenda: eventos no Google Agenda (10 min, alarme, termo de busca, loja, link, legenda, lembrete do rótulo de IA).
10. Dizer ao dono: rodar FAZER-TUDO.bat (ou deixar o agendamento) e conferir `VIDEOS-PRONTOS\ULTIMA-EXECUCAO.txt`.
