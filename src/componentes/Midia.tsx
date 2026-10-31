import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonte";

const ehVideo = (arq: string) => /\.(mp4|mov|webm|m4v)$/i.test(arq);
export const ehRecorte = (arq: string) => /recorte/i.test(arq) && /\.png$/i.test(arq);

// Tratamento leve das fotos/vídeos: um pouco mais de contraste, cor e brilho.
// Não muda a forma nem a cor real do produto, só tira o aspecto "lavado".
const TRATO = "contrast(1.07) saturate(1.1) brightness(1.03)";

const Arquivo: React.FC<{ arquivo: string; style: React.CSSProperties; inicio?: number }> = ({ arquivo, style, inicio }) => {
  const { fps } = useVideoConfig();
  const src = arquivo.startsWith("http") ? arquivo : staticFile(arquivo);
  return ehVideo(arquivo) ? (
    <OffthreadVideo src={src} muted style={style} trimBefore={inicio ? Math.round(inicio * fps) : undefined} />
  ) : (
    <Img src={src} style={style} />
  );
};

/** Produto recortado em um "estúdio": fundo com luz suave, sombra no chão, leve flutuação e cards de informação. */
const Estudio: React.FC<{ arquivo: string; topo: number; altura: number; cor: string; info?: string[]; dur: number; pronto?: boolean }> = ({
  arquivo,
  pronto,
  topo,
  altura,
  cor,
  info,
  dur,
}) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  // cenas curtas (troca rápida de cor): o produto já aparece pronto
  const entra = pronto || dur < 30 ? 1 : spring({ frame, fps, config: { damping: 14, stiffness: 120 } });
  const flutua = Math.sin(frame / 18) * 10;
  const temInfo = (info?.length ?? 0) > 0;
  const alturaProduto = altura * (temInfo ? 0.46 : 0.66);
  const centroY = topo + altura * (temInfo ? 0.3 : 0.4);
  const zoom = interpolate(frame, [0, dur], [1, 1.06]);
  return (
    <>
      {/* fundo de estúdio na cor do vídeo */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 75% 45% at 50% ${(centroY / 1920) * 100}%, #ffffff 0%, color-mix(in srgb, ${cor} 18%, #f4f4f4) 45%, color-mix(in srgb, ${cor} 55%, #1d1d1d) 100%)`,
        }}
      />
      {/* brilho suave girando atrás do produto */}
      <div
        style={{
          position: "absolute",
          left: width / 2 - 520,
          top: centroY - 520,
          width: 1040,
          height: 1040,
          borderRadius: "50%",
          background: `conic-gradient(from ${frame * 0.6}deg, transparent 0deg, rgba(255,255,255,0.55) 25deg, transparent 60deg, transparent 180deg, rgba(255,255,255,0.4) 205deg, transparent 240deg)`,
          filter: "blur(30px)",
          opacity: 0.7,
        }}
      />
      {/* sombra no chão */}
      <div
        style={{
          position: "absolute",
          left: width / 2 - 300,
          top: centroY + alturaProduto / 2 + 10,
          width: 600,
          height: 70,
          borderRadius: "50%",
          background: "radial-gradient(ellipse at center, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0) 70%)",
          transform: `scaleX(${1 - flutua / 200})`,
        }}
      />
      {/* produto (só recortado, sem nenhuma alteração) */}
      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          top: centroY - alturaProduto / 2,
          height: alturaProduto,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `translateY(${flutua + interpolate(entra, [0, 1], [120, 0])}px) scale(${interpolate(entra, [0, 1], [0.7, 1]) * zoom})`,
          opacity: entra,
        }}
      >
        <Img
          src={staticFile(arquivo)}
          style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", filter: "drop-shadow(0 24px 30px rgba(0,0,0,0.28)) contrast(1.04)" }}
        />
      </div>
      {/* cards de informação, abaixo do produto (nunca em cima dele) */}
      {temInfo && (
        <div
          style={{
            position: "absolute",
            left: 70,
            right: 70,
            top: centroY + alturaProduto / 2 + 45,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 20,
          }}
        >
          {info!.map((t, i) => {
            const p = spring({ frame: frame - 8 - i * 7, fps, config: { damping: 12, stiffness: 180 } });
            return (
              <div
                key={i}
                style={{
                  fontFamily,
                  fontWeight: 800,
                  fontSize: 42,
                  color: "#1b1b1b",
                  background: "rgba(255,255,255,0.95)",
                  borderRadius: 999,
                  padding: "16px 30px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
                  border: `4px solid ${cor}`,
                  opacity: p,
                  transform: `translateY(${interpolate(p, [0, 1], [40, 0])}px) scale(${interpolate(p, [0, 1], [0.8, 1])})`,
                }}
              >
                <span style={{ color: cor, fontSize: 40 }}>✔</span>
                {t}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

/**
 * Mostra a mídia na faixa do produto (vertical 1080x1920):
 *  - foto/vídeo comum: preenche a faixa inteira (ajuste "preencher")
 *  - foto com textos/infográfico: aparece INTEIRA, sem corte (ajuste "inteira")
 *  - PNG de recorte: produto no estúdio, com cards de informação
 */
export const Midia: React.FC<{
  arquivo: string;
  inicio?: number;
  dur: number;
  escurecer?: number;
  zoomDe?: number;
  zoomPara?: number;
  topo?: number;
  alturaFrente?: number;
  ajuste?: "preencher" | "inteira";
  cor?: string;
  info?: string[];
  pronto?: boolean;
}> = ({ pronto, arquivo, inicio, dur, escurecer = 0, zoomDe = 1, zoomPara = 1.1, topo = 0, alturaFrente = 1920, ajuste = "preencher", cor = "#EE4D2D", info }) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const zoom = interpolate(frame, [0, dur], [zoomDe, zoomPara], { extrapolateRight: "clamp" });
  const entrada = interpolate(frame, [0, 6], [1.08, 1], { extrapolateRight: "clamp" });

  if (ehRecorte(arquivo)) {
    return (
      <AbsoluteFill>
        <Estudio pronto={pronto} arquivo={arquivo} topo={topo} altura={alturaFrente} cor={cor} info={info} dur={dur} />
        {escurecer > 0 && <AbsoluteFill style={{ backgroundColor: `rgba(0,0,0,${escurecer})` }} />}
      </AbsoluteFill>
    );
  }

  const inteira = ajuste === "inteira";
  const textoNoTopo = topo > 0;
  const textoEmbaixo = topo === 0 && alturaFrente < 1920;

  if (!inteira && (textoNoTopo || textoEmbaixo)) {
    // Cena com texto: o texto NUNCA fica em cima do produto.
    // A foto/vídeo ocupa só a faixa do produto (corte "cover", sem desfoque) e a
    // faixa do texto ganha um painel sólido na cor do vídeo.
    const fimFaixa = topo + alturaFrente;
    return (
      <AbsoluteFill
        style={{
          background: `linear-gradient(${textoNoTopo ? "to bottom" : "to top"}, color-mix(in srgb, ${cor} 55%, #111) 0%, color-mix(in srgb, ${cor} 25%, #0d0d0d) 100%)`,
        }}
      >
        <div style={{ position: "absolute", left: 0, width, top: topo, height: alturaFrente, overflow: "hidden", backgroundColor: "#111" }}>
          <div style={{ width: "100%", height: "100%", transform: `scale(${zoom * entrada})` }}>
            <Arquivo arquivo={arquivo} inicio={inicio} style={{ width: "100%", height: "100%", objectFit: "cover", filter: TRATO }} />
          </div>
          {escurecer > 0 && <AbsoluteFill style={{ backgroundColor: `rgba(0,0,0,${escurecer})` }} />}
        </div>
        {/* filete na cor do vídeo separando texto e produto */}
        <div style={{ position: "absolute", left: 0, width, height: 8, top: textoNoTopo ? topo - 4 : fimFaixa - 4, background: cor }} />
      </AbsoluteFill>
    );
  }

  if (!inteira) {
    // cena sem texto: a foto/vídeo ocupa os 1080x1920 inteiros, sem faixa desfocada.
    return (
      <AbsoluteFill style={{ backgroundColor: "#111", overflow: "hidden" }}>
        <AbsoluteFill style={{ transform: `scale(${zoom * entrada})` }}>
          <Arquivo arquivo={arquivo} inicio={inicio} style={{ width: "100%", height: "100%", objectFit: "cover", filter: TRATO }} />
        </AbsoluteFill>
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.25) 100%)" }} />
        {textoNoTopo && (
          <AbsoluteFill style={{ background: `linear-gradient(to bottom, rgba(0,0,0,0.6) 0px, rgba(0,0,0,0.25) ${topo * 0.75}px, rgba(0,0,0,0) ${topo + 60}px)` }} />
        )}
        {textoEmbaixo && (
          <AbsoluteFill style={{ background: `linear-gradient(to top, rgba(0,0,0,0.65) 0px, rgba(0,0,0,0.3) ${1920 - alturaFrente - 60}px, rgba(0,0,0,0) ${1920 - alturaFrente + 120}px)` }} />
        )}
        {escurecer > 0 && <AbsoluteFill style={{ backgroundColor: `rgba(0,0,0,${escurecer})` }} />}
      </AbsoluteFill>
    );
  }

  // foto com informações (infográfico): aparece inteira, num fundo de estúdio na cor do vídeo
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 80% 55% at 50% ${((topo + alturaFrente / 2) / 1920) * 100}%, #ffffff 0%, color-mix(in srgb, ${cor} 22%, #f2f2f2) 50%, color-mix(in srgb, ${cor} 60%, #1d1d1d) 100%)`,
      }}
    >
      <div style={{ position: "absolute", top: topo, left: 0, width, height: alturaFrente, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "100%", display: "flex", justifyContent: "center", transform: `scale(${1 + (zoom - 1) * 0.25})` }}>
          <Arquivo
            arquivo={arquivo}
            inicio={inicio}
            style={{ width: "94%", height: "auto", objectFit: "contain", filter: TRATO, borderRadius: 28, boxShadow: "0 24px 70px rgba(0,0,0,0.4)" }}
          />
        </div>
      </div>
      {escurecer > 0 && <AbsoluteFill style={{ backgroundColor: `rgba(0,0,0,${escurecer})` }} />}
    </AbsoluteFill>
  );
};
