# Shopee Vídeos — kit inicial

Sistema que gera vídeos verticais para o **Shopee Vídeos** (afiliados), com narração do ElevenLabs e montagem automática no Remotion.
O Claude garimpa os produtos, monta roteiros e cenas; o seu PC narra e renderiza (de madrugada, se quiser).

> Repositório **privado**, só para pessoas convidadas. Não compartilhe o link.

## Instalação (Windows)

1. **Baixe o kit**
   - Com GitHub: botão verde **Use this template → Create a new repository** (deixe *Private*) e depois clone o seu repositório; ou
   - Sem GitHub: **Code → Download ZIP** e extraia numa pasta sem acentos, ex.: `C:\ShopeeVideos`.
2. Dê dois cliques em **`1-INSTALAR.bat`**. Se faltar o Node.js, ele oferece instalar.
3. Responda as perguntas (Enter aceita a opção recomendada):

| # | Pergunta | Opções |
|---|---|---|
| 1 | Seu nome | texto livre |
| 2 | Nicho da conta | casa e cozinha, organização e limpeza, pet, carro e moto, eletroportáteis, beleza (sem rosto), fitness, outro |
| 3 | Chave da API do ElevenLabs | colar agora (fica oculta) ou depois |
| 4 | Voz da narração | lista as vozes da **sua** conta ElevenLabs, colar um ID, ou decidir depois. Vozes já usadas no grupo são bloqueadas |
| 5 | Vídeos por dia | 10, 20, 30 ou outro (mostra os créditos ElevenLabs por mês) |
| 6 | Horário das postagens | 09:00–21:30, 08:00–22:00, 11:00–23:00 ou outro |
| 7 | Critérios do garimpo | padrão, mais exigente, mais aberto ou personalizar (preço, comissão, nota, vendas, estoque) |
| 8 | Cor de destaque | laranja Shopee, vermelho, rosa, roxo, azul, verde ou outra |
| 9 | Automação de madrugada | 04:00, outro horário ou não |
| 10 | Google Drive | não uso, já sincronizo a pasta, ou copiar para uma pasta do Drive |
| 11 | Versão Instagram | não (recomendado) ou sim |

O instalador então instala as dependências, prepara as pastas, salva tudo em `conta.json`, guarda uma cópia de segurança do código
e (se escolhido) agenda a automação. Para mudar qualquer resposta, rode o `1-INSTALAR.bat` de novo.

## Ligando o Claude

- **Claude Code** (ou app do Claude com acesso à pasta): abra esta pasta. O `CLAUDE.md` e as skills de `.claude/skills/` já são carregados.
- **claude.ai**: envie os `.zip` de `PARA-O-CLAUDE\skills` em *Configurações → Skills* e os arquivos de `PARA-O-CLAUDE\documentos` no seu projeto.

Depois é só pedir: *"faz a primeira leva de 30 vídeos para amanhã"*.
Na primeira leva o Claude também monta a **biblioteca de músicas da sua conta** (a pasta `public/musicas` vem vazia de propósito,
para cada conta ter o seu som). Ele busca faixas de licença livre e registra os créditos em `public/musicas/CREDITOS.txt`.

## Uso diário

| Arquivo | Para quê |
|---|---|
| `FAZER-TUDO.bat` | narra, renderiza, confere e organiza os vídeos do dia (é o que a automação roda) |
| `AGENDAR-MADRUGADA.bat` / `DESAGENDAR-MADRUGADA.bat` | liga/desliga a automação |
| `3-ABRIR-STUDIO.bat` | abre o Remotion Studio para ver e ajustar os vídeos ao vivo |
| `4-GERAR-NARRACOES.bat` / `2-RENDERIZAR.bat` | as etapas separadas |
| `VOLTAR-VERSAO-ESTAVEL.bat` | desfaz mudanças no código (vídeos e produtos não são tocados) |

Os vídeos saem em `VIDEOS-PRONTOS\DD-MM-AAAA\`, com a legenda de cada um e o `00-POSTAGEM.txt` do dia.
Ao postar: rótulo de conteúdo de IA **ligado** e "Permitir reutilização do conteúdo" **desligado**.

Detalhes técnicos dos campos do JSON: [LEIA-ME.md](LEIA-ME.md).

## Para quem mantém o kit

- Vozes já usadas no grupo: lista `VOZES_EM_USO` em `scripts/instalar/instalar.mjs`. Acrescente a voz de cada pessoa nova.
- Músicas já usadas no grupo: `scripts/ferramentas-claude/musicas-do-grupo.json` (só a impressão digital de cada faixa).
  Para acrescentar as de uma conta nova, rode lá `node scripts/ferramentas-claude/checar-musicas.mjs --hashes` e cole o resultado na lista `faixas`.
