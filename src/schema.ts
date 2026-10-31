import { z } from "zod";

export const midiaSchema = z.object({
  // caminho dentro da pasta public/, ex: "produtos/organizador/foto1.jpg" (aceita .jpg .png .webp .mp4 .mov .webm)
  arquivo: z.string(),
  // frase que aparece em cima dessa cena (opcional)
  texto: z.string().optional(),
  // para vídeos: a partir de qual segundo do clipe começar (opcional)
  inicio: z.number().optional(),
  // duração da cena em segundos (padrão 3)
  duracao: z.number().optional(),
  // "preencher" (padrão): ocupa a faixa toda | "inteira": foto com textos aparece sem corte
  ajuste: z.enum(["preencher", "inteira"]).optional(),
  // só para recortes (PNG com "recorte" no nome): cards de informação abaixo do produto
  info: z.array(z.string()).optional(),
});

export const legendaSchema = z.object({
  texto: z.string(),
  inicio: z.number(), // segundos
  fim: z.number(), // segundos
});

export const videoSchema = z.object({
  slug: z.string(),
  gancho: z.string(),
  nomeProduto: z.string(),
  // foto principal usada no gancho, no preço e no final (opcional; padrão = primeira mídia)
  capa: z.string().optional(),
  // mídia de fundo do gancho (ex: um trecho de vídeo). Padrão = capa
  ganchoMidia: midiaSchema.optional(),
  // visual da capa: "fogo" (padrão), "branco", "escuro" ou "fita"
  estiloCapa: z.enum(["fogo", "branco", "escuro", "fita"]).optional(),
  // texto do selo acima do título da capa (padrão "🔥 Achadinho do dia")
  selo: z.string().optional(),
  midias: z.array(midiaSchema).min(1),
  beneficios: z.array(z.string()).optional(),
  precoDe: z.string().optional(),
  precoPor: z.string().optional(),
  cta: z.string().optional(),
  narracao: z.string().optional(),
  // versão Instagram: corta a narração neste segundo (antes do "toca no carrinho") e toca narracaoFinal em seguida
  narracaoAte: z.number().optional(),
  narracaoFinal: z.string().optional(),
  musica: z.string().optional(),
  volumeMusica: z.number().optional(),
  legendas: z.array(legendaSchema).optional(),
  corDestaque: z.string().optional(),
  // efeito decorativo por cima do vídeo: "neve" (Natal) ou nada
  efeito: z.enum(["neve", "nenhum"]).optional(),
  // onde aparece a frase de cada cena: "topo" (padrão) ou "base"
  posicaoTexto: z.enum(["topo", "base"]).optional(),
  // alterna zoom entrando / saindo entre as cenas
  zoomAlternado: z.boolean().optional(),
  // durações (s) das cenas fixas, para casar com a narração (opcional)
  tempos: z.object({ gancho: z.number().optional(), beneficios: z.number().optional(), preco: z.number().optional(), cta: z.number().optional() }).optional(),
  // preenchido automaticamente (duração do áudio de narração, em segundos)
  duracaoAudio: z.number().optional(),
});

export type VideoProps = z.infer<typeof videoSchema>;
export type Midia = z.infer<typeof midiaSchema>;
