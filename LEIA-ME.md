# Shopee Vídeos com Remotion

Gera vídeos verticais (1080x1920, 30fps, MP4) para o Shopee Vídeos a partir de fotos/vídeos do produto + um arquivo JSON.

Cada vídeo segue a estrutura: **Gancho → Cenas do produto → Benefícios → Preço com desconto → Chamada pro carrinho**,
com barra de progresso no topo e textos posicionados fora da área coberta pelos botões do app.

## Primeira vez (Windows)

Dê dois cliques no `1-INSTALAR.bat` (veja o README.md).

(Na primeira renderização o Remotion baixa sozinho o navegador que ele usa — demora um pouco só da primeira vez.)

## Criar um vídeo novo

1. Crie uma pasta com as mídias: `public/produtos/MEU-PRODUTO/` e coloque as fotos (`.jpg/.png/.webp`) ou clipes (`.mp4`, por exemplo os do Grok/Kling).
2. Copie `produtos/_arquivados/exemplo.json` para `produtos/MEU-PRODUTO.json` e edite:

| Campo | O que é |
|---|---|
| `slug` | nome do vídeo (só letras, números e hífen) — igual ao nome do arquivo |
| `gancho` | frase de impacto dos primeiros 2,5 s |
| `nomeProduto` | nome que aparece nos benefícios e no final |
| `capa` | foto principal do gancho e do final (opcional) |
| `midias` | lista de fotos/vídeos. `texto` = frase da cena (opcional), `duracao` = segundos (padrão 3) |
| `beneficios` | lista de vantagens (opcional — se tirar, a cena some) |
| `precoDe` / `precoPor` | preço antigo e atual. O selo de % OFF é calculado sozinho. Sem `precoPor`, a cena de preço some |
| `cta` | texto da chamada final |
| `narracao` | áudio do ElevenLabs, ex: `"produtos/MEU-PRODUTO/narracao.mp3"` (opcional). **O vídeo estica sozinho para durar o mesmo que a narração** |
| `musica` | música de fundo (opcional, entra baixinha se tiver narração) |
| `volumeMusica` | 0 a 1 (padrão 0.12 com narração, 0.5 sem) |
| `legendas` | legendas sincronizadas: `{ "texto": "...", "inicio": 2.6, "fim": 4.5 }` em segundos (opcional) |
| `efeito` | `"neve"` para neve caindo (Natal) |
| `corDestaque` | cor principal (padrão laranja Shopee `#EE4D2D`) |

## Ver e ajustar ao vivo

```
npm run dev
```

Abre o Remotion Studio no navegador: cada JSON da pasta `produtos/` aparece na lista da esquerda. Dá pra mexer nos textos pelo painel da direita e ver na hora.

## Gerar os MP4

```
npm run render              (renderiza todos os JSON)
npm run render -- MEU-PRODUTO   (só um)
```

Os vídeos saem em `out/`.

## Onde mexer no visual

- `src/Cenas.tsx` — layout e animação de cada cena
- `src/timeline.ts` — duração padrão de cada cena
- `src/componentes/Midia.tsx` — zoom e fundo desfocado das fotos
