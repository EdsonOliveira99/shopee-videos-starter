import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonte";
import type { VideoProps } from "../schema";
import { FPS } from "../timeline";

/** Barrinha de progresso no topo — ajuda a segurar a pessoa até o fim. */
export const BarraProgresso: React.FC<{ cor: string }> = ({ cor }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const pct = (frame / durationInFrames) * 100;
  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 12, background: "rgba(255,255,255,0.25)" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: cor }} />
    </div>
  );
};

/** Legendas sincronizadas (tempos em segundos). */
export const Legendas: React.FC<{ legendas: NonNullable<VideoProps["legendas"]>; cor: string }> = ({ legendas, cor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / FPS;
  const atual = legendas.find((l) => t >= l.inicio && t < l.fim);
  if (!atual) return null;
  const desde = frame - Math.round(atual.inicio * FPS);
  const pop = spring({ frame: desde, fps, config: { damping: 12, stiffness: 220 } });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 520, paddingLeft: 70, paddingRight: 150 }}>
      <div
        style={{
          fontFamily,
          fontWeight: 900,
          fontSize: 62,
          lineHeight: 1.15,
          color: "white",
          textAlign: "center",
          textTransform: "uppercase",
          background: "rgba(0,0,0,0.72)",
          padding: "14px 28px",
          borderRadius: 18,
          borderBottom: `8px solid ${cor}`,
          transform: `scale(${interpolate(pop, [0, 1], [0.7, 1])})`,
        }}
      >
        {atual.texto}
      </div>
    </AbsoluteFill>
  );
};

/** Neve caindo (efeito de Natal). Determinística: sai igual em toda renderização. */
export const Neve: React.FC<{ quantidade?: number }> = ({ quantidade = 70 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {new Array(quantidade).fill(0).map((_, i) => {
        const tam = 6 + random(`t${i}`) * 16;
        const vel = 1.2 + random(`v${i}`) * 2.8 + tam * 0.08;
        const x0 = random(`x${i}`) * width;
        const y = ((random(`y${i}`) * (height + 100) + frame * vel) % (height + 100)) - 50;
        const x = x0 + Math.sin((frame + i * 20) / (25 + random(`d${i}`) * 25)) * 30;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: tam,
              height: tam,
              borderRadius: "50%",
              background: "white",
              opacity: 0.45 + random(`o${i}`) * 0.45,
              filter: tam > 16 ? "blur(2px)" : undefined,
              boxShadow: "0 0 8px rgba(255,255,255,0.8)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
