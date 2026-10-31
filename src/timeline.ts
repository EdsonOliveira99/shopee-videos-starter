import type { Midia, VideoProps } from "./schema";

export const FPS = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;

const GANCHO = 2.5;
const DUR_MIDIA = 3;
const BENEFICIOS = 4;
const PRECO = 3;
const CTA = 3;

export type Segmento =
  | { tipo: "gancho"; inicio: number; dur: number; midia: Midia; broll?: Midia }
  | { tipo: "midia"; inicio: number; dur: number; midia: Midia }
  | { tipo: "beneficios"; inicio: number; dur: number; midia: Midia }
  | { tipo: "preco"; inicio: number; dur: number; midia: Midia }
  | { tipo: "cta"; inicio: number; dur: number; midia: Midia };

const f = (s: number) => Math.round(s * FPS);

/**
 * Monta a sequência de cenas. Se houver narração mais longa que o vídeo,
 * as cenas de mídia são esticadas para o vídeo terminar junto com o áudio.
 */
export const montarTimeline = (p: VideoProps): { segmentos: Segmento[]; total: number } => {
  const temBeneficios = (p.beneficios?.length ?? 0) > 0;
  const temPreco = Boolean(p.precoPor);
  const DUR_GANCHO = p.tempos?.gancho ?? GANCHO;
  const DUR_BENEFICIOS = p.tempos?.beneficios ?? BENEFICIOS;
  const DUR_PRECO = p.tempos?.preco ?? PRECO;
  const DUR_CTA = p.tempos?.cta ?? CTA;
  const fixos =
    DUR_GANCHO + (temBeneficios ? DUR_BENEFICIOS : 0) + (temPreco ? DUR_PRECO : 0) + DUR_CTA;
  let duracoesMidia = p.midias.map((m) => m.duracao ?? DUR_MIDIA);
  const somaMidia = duracoesMidia.reduce((a, b) => a + b, 0);

  if (p.duracaoAudio) {
    const alvo = p.duracaoAudio + 0.6; // pequena folga no final
    const falta = alvo - (fixos + somaMidia);
    if (falta > 0) {
      const escala = (somaMidia + falta) / somaMidia;
      duracoesMidia = duracoesMidia.map((d) => d * escala);
    }
  }

  const segs: Segmento[] = [];
  let t = 0;
  const add = (tipo: Segmento["tipo"], dur: number, midia: Midia) => {
    segs.push({ tipo, inicio: t, dur: f(dur), midia } as Segmento);
    t += f(dur);
  };

  const capa: Midia = p.capa ? { arquivo: p.capa } : p.midias[0];
  // fundo do card de benefícios: o recorte do produto, se houver (fica mais bonito que foto)
  const recorte = p.midias.find((m) => /recorte/i.test(m.arquivo));
  const ultima = p.capa ? capa : p.midias[p.midias.length - 1];
  add("gancho", DUR_GANCHO, capa);
  if (p.ganchoMidia) (segs[segs.length - 1] as { broll?: Midia }).broll = p.ganchoMidia;
  p.midias.forEach((m, i) => add("midia", duracoesMidia[i], m));
  if (temBeneficios) add("beneficios", DUR_BENEFICIOS, recorte ? { arquivo: recorte.arquivo } : p.midias[Math.min(1, p.midias.length - 1)]);
  if (temPreco) add("preco", DUR_PRECO, capa);
  add("cta", DUR_CTA, ultima);

  return { segmentos: segs, total: t };
};
