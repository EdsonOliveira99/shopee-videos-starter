import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Midia } from "./componentes/Midia";
import { fontFamily } from "./fonte";
import type { Midia as MidiaT } from "./schema";

// Áreas seguras: a interface do Shopee Vídeos cobre a lateral direita (curtir/compartilhar)
// e a parte de baixo (descrição + card do produto). O texto fica fora dessas áreas.
const SEGURO = { topo: 170, base: 430, esq: 64, dir: 150 };

// Faixas fixas: o texto nunca fica em cima do produto, e o produto preenche
// todo o resto da tela vertical (até a borda).
//  - texto no topo:  texto 190–470   | produto 480–1920
//  - texto embaixo:  produto 0–1190  | texto 1205–1480 (acima dos botões do app)
//  - gancho:         texto 170–600   | produto 610–1920
const FAIXA = {
  topo: { texto: [190, 470], produto: [480, 1920] },
  base: { texto: [1205, 1480], produto: [0, 1190] },
  gancho: { texto: [170, 600], produto: [610, 1920] },
  beneficios: { texto: [170, 800], produto: [810, 1920] },
  cta: { texto: [170, 640], produto: [650, 1920] },
};

const usePop = (atraso = 0, damping = 11) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - atraso, fps, config: { damping, stiffness: 200, mass: 0.7 } });
};

const Caixa: React.FC<{ cor: string; children: React.ReactNode; fontSize?: number; rot?: number; style?: React.CSSProperties }> = ({
  cor,
  children,
  fontSize = 74,
  rot = -2,
  style,
}) => (
  <div
    style={{
      fontFamily,
      fontWeight: 900,
      fontSize,
      lineHeight: 1.1,
      color: "white",
      background: cor,
      padding: "22px 34px",
      borderRadius: 26,
      textAlign: "center",
      textTransform: "uppercase",
      boxShadow: "0 18px 50px rgba(0,0,0,0.45)",
      transform: `rotate(${rot}deg)`,
      ...style,
    }}
  >
    {children}
  </div>
);

/**
 * Abertura / CAPA do vídeo. O frame 0 já sai pronto (é ele que o Shopee usa como capa):
 * produto ocupando a tela inteira + título grande. Se houver b-roll de gancho,
 * ele entra depois de ~0,8s, mantendo o título.
 */
type EstiloCapa = "fogo" | "branco" | "escuro" | "fita";
const estiloDaCapa = (estilo: EstiloCapa, cor: string) => {
  switch (estilo) {
    case "branco":
      return {
        selo: { color: "white", background: cor } as React.CSSProperties,
        caixa: { background: "white", color: "#111", border: `6px solid ${cor}`, padding: "26px 40px" } as React.CSSProperties,
        rot: 2,
      };
    case "escuro":
      return {
        selo: { color: "#111", background: "white" } as React.CSSProperties,
        caixa: { background: "rgba(10,10,10,0.88)", color: cor, border: `6px solid ${cor}`, padding: "26px 40px", textShadow: "0 4px 18px rgba(0,0,0,0.6)" } as React.CSSProperties,
        rot: 0,
      };
    case "fita":
      return {
        selo: { color: "white", background: "#111" } as React.CSSProperties,
        caixa: { border: "none", padding: "30px 44px", borderRadius: 8, boxShadow: `0 18px 50px rgba(0,0,0,0.45), 14px 14px 0 #111` } as React.CSSProperties,
        rot: -3,
      };
    default:
      return {
        selo: { color: "#111", background: "#FFD600" } as React.CSSProperties,
        caixa: { border: "6px solid white", padding: "26px 40px" } as React.CSSProperties,
        rot: -2,
      };
  }
};

export const CenaGancho: React.FC<{ midia: MidiaT; broll?: MidiaT; dur: number; texto: string; cor: string; estilo?: EstiloCapa; selo?: string }> = ({
  midia,
  broll,
  dur,
  texto,
  cor,
  estilo = "fogo",
  selo = "🔥 Achadinho do dia",
}) => {
  const est = estiloDaCapa(estilo, cor);
  const frame = useCurrentFrame();
  const CORTE = 24;
  const respira = 1 + Math.sin(frame / 7) * 0.018;
  const opBroll = broll ? interpolate(frame, [CORTE, CORTE + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  return (
    <AbsoluteFill>
      <Midia
        arquivo={midia.arquivo}
        inicio={midia.inicio}
        dur={dur}
        zoomDe={1.0}
        zoomPara={1.08}
        pronto
        cor={cor}
        topo={FAIXA.gancho.produto[0]}
        alturaFrente={FAIXA.gancho.produto[1] - FAIXA.gancho.produto[0]}
      />
      {broll && frame >= CORTE && (
        <AbsoluteFill style={{ opacity: opBroll }}>
          <Midia
            arquivo={broll.arquivo}
            inicio={broll.inicio}
            dur={dur - CORTE}
            zoomDe={1.1}
            zoomPara={1.0}
            cor={cor}
            topo={FAIXA.gancho.produto[0]}
            alturaFrente={FAIXA.gancho.produto[1] - FAIXA.gancho.produto[0]}
          />
        </AbsoluteFill>
      )}
      <div
        style={{
          position: "absolute",
          top: FAIXA.gancho.texto[0],
          height: FAIXA.gancho.texto[1] - FAIXA.gancho.texto[0],
          left: SEGURO.esq,
          right: SEGURO.esq,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 26,
        }}
      >
        <div
          style={{
            fontFamily,
            fontWeight: 900,
            fontSize: 40,
            letterSpacing: 2,
            padding: "10px 28px",
            borderRadius: 999,
            textTransform: "uppercase",
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
            ...est.selo,
          }}
        >
          {selo}
        </div>
        <div style={{ transform: `scale(${respira})` }}>
          <Caixa cor={cor} fontSize={86} rot={est.rot} style={est.caixa}>
            {texto}
          </Caixa>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const CenaMidia: React.FC<{ midia: MidiaT; dur: number; cor: string; base?: boolean; zoomSaindo?: boolean }> = ({
  midia,
  dur,
  cor,
  base,
  zoomSaindo,
}) => {
  const pop = usePop(4, 13);
  const f = midia.texto ? (base ? FAIXA.base : FAIXA.topo) : null;
  return (
    <AbsoluteFill>
      <Midia
        arquivo={midia.arquivo}
        inicio={midia.inicio}
        dur={dur}
        zoomDe={zoomSaindo ? 1.12 : 1}
        zoomPara={zoomSaindo ? 1 : 1.1}
        ajuste={midia.ajuste}
        cor={cor}
        info={midia.info}
        topo={f ? f.produto[0] : 0}
        alturaFrente={f ? f.produto[1] - f.produto[0] : 1920}
      />
      {f && (
        <div
          style={{
            position: "absolute",
            top: f.texto[0],
            height: f.texto[1] - f.texto[0],
            left: SEGURO.esq,
            right: SEGURO.esq,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ transform: `translateY(${interpolate(pop, [0, 1], [base ? 60 : -60, 0])}px)`, opacity: pop }}>
            <Caixa cor="rgba(0,0,0,0.78)" fontSize={58} rot={0} style={{ borderLeft: `14px solid ${cor}` }}>
              {midia.texto}
            </Caixa>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

const ItemBeneficio: React.FC<{ texto: string; i: number; cor: string }> = ({ texto, i, cor }) => {
  const pop = usePop(8 + i * 12, 12);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 26,
        opacity: pop,
        transform: `translateX(${interpolate(pop, [0, 1], [-120, 0])}px)`,
        fontFamily,
        fontWeight: 800,
        fontSize: 46,
        color: "#1a1a1a",
        lineHeight: 1.15,
      }}
    >
      <div
        style={{
          flexShrink: 0,
          width: 64,
          height: 64,
          borderRadius: 32,
          background: cor,
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 46,
        }}
      >
        ✓
      </div>
      {texto}
    </div>
  );
};

export const CenaBeneficios: React.FC<{ midia: MidiaT; dur: number; itens: string[]; titulo: string; cor: string }> = ({
  midia,
  dur,
  itens,
  titulo,
  cor,
}) => {
  const pop = usePop(0, 14);
  return (
    <AbsoluteFill>
      <Midia
        arquivo={midia.arquivo}
        inicio={midia.inicio}
        dur={dur}
        ajuste={midia.ajuste}
        cor={cor}
        topo={FAIXA.beneficios.produto[0]}
        alturaFrente={FAIXA.beneficios.produto[1] - FAIXA.beneficios.produto[0]}
      />
      <div
        style={{
          position: "absolute",
          top: FAIXA.beneficios.texto[0],
          height: FAIXA.beneficios.texto[1] - FAIXA.beneficios.texto[0],
          left: SEGURO.esq,
          right: SEGURO.esq,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.96)",
            borderRadius: 36,
            padding: "36px 40px",
            display: "flex",
            flexDirection: "column",
            gap: 22,
            width: "100%",
            transform: `scale(${interpolate(pop, [0, 1], [0.85, 1])})`,
            opacity: pop,
            boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
          }}
        >
          <div style={{ fontFamily, fontWeight: 900, fontSize: 44, color: cor, textTransform: "uppercase" }}>{titulo}</div>
          {itens.map((t, i) => (
            <ItemBeneficio key={i} texto={t} i={i} cor={cor} />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const calcularDesconto = (de?: string, por?: string) => {
  const num = (s?: string) => (s ? parseFloat(s.replace(/[^\d,]/g, "").replace(",", ".")) : NaN);
  const a = num(de);
  const b = num(por);
  if (!a || !b || b >= a) return null;
  return Math.round((1 - b / a) * 100);
};

export const CenaPreco: React.FC<{ midia: MidiaT; dur: number; precoDe?: string; precoPor: string; cor: string }> = ({
  midia,
  dur,
  precoDe,
  precoPor,
  cor,
}) => {
  const frame = useCurrentFrame();
  const pop = usePop(4, 10);
  const selo = usePop(16, 7);
  const desconto = calcularDesconto(precoDe, precoPor);
  const pulso = 1 + Math.sin(frame / 4) * 0.025;
  return (
    <AbsoluteFill>
      <Midia arquivo={midia.arquivo} inicio={midia.inicio} dur={dur} topo={SEGURO.topo} alturaFrente={820} zoomDe={1} zoomPara={1.06} />
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: SEGURO.base, paddingLeft: SEGURO.esq, paddingRight: SEGURO.dir }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, transform: `scale(${interpolate(pop, [0, 1], [0.5, 1])})`, opacity: pop }}>
          {precoDe && (
            <div style={{ fontFamily, fontWeight: 800, fontSize: 54, color: "rgba(255,255,255,0.85)", textDecoration: "line-through", textDecorationThickness: 5 }}>
              De {precoDe}
            </div>
          )}
          <div style={{ transform: `scale(${pulso})` }}>
            <Caixa cor={cor} fontSize={110} rot={0}>
              <span style={{ fontSize: 50, display: "block" }}>Por apenas</span>
              {precoPor}
            </Caixa>
          </div>
        </div>
      </AbsoluteFill>
      {desconto && (
        <div
          style={{
            position: "absolute",
            top: SEGURO.topo + 30,
            right: SEGURO.dir - 40,
            width: 230,
            height: 230,
            borderRadius: 115,
            background: "#FFD600",
            color: "#111",
            fontFamily,
            fontWeight: 900,
            fontSize: 72,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
            boxShadow: "0 14px 40px rgba(0,0,0,0.45)",
            transform: `scale(${selo}) rotate(${interpolate(selo, [0, 1], [-90, 12])}deg)`,
          }}
        >
          -{desconto}%<span style={{ fontSize: 34 }}>OFF</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export const CenaCta: React.FC<{ midia: MidiaT; dur: number; texto: string; nome: string; cor: string }> = ({ midia, dur, texto, nome, cor }) => {
  const frame = useCurrentFrame();
  const pop = usePop(2, 10);
  const pulo = Math.abs(Math.sin(frame / 5)) * 40;
  return (
    <AbsoluteFill>
      <Midia
        arquivo={midia.arquivo}
        inicio={midia.inicio}
        dur={dur}
        ajuste={midia.ajuste}
        cor={cor}
        topo={FAIXA.cta.produto[0]}
        alturaFrente={FAIXA.cta.produto[1] - FAIXA.cta.produto[0]}
      />
      <div
        style={{
          position: "absolute",
          top: FAIXA.cta.texto[0],
          height: FAIXA.cta.texto[1] - FAIXA.cta.texto[0],
          left: SEGURO.esq,
          right: SEGURO.esq,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
        }}
      >
        <div style={{ fontFamily, fontWeight: 800, fontSize: 50, color: "white", textAlign: "center", opacity: pop, textShadow: "0 4px 20px rgba(0,0,0,0.7)" }}>
          {nome}
        </div>
        <div style={{ transform: `scale(${interpolate(pop, [0, 1], [0.4, 1])})` }}>
          <Caixa cor={cor} fontSize={70}>
            {texto}
          </Caixa>
        </div>
      </div>
      {/* seta apontando para o card do produto (canto inferior esquerdo no Shopee Vídeos) */}
      <svg
        width={250}
        height={250}
        viewBox="0 0 100 100"
        style={{
          position: "absolute",
          left: 70,
          bottom: SEGURO.base - 90 + pulo,
          opacity: pop,
          filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.6))",
          transform: "rotate(135deg)",
        }}
      >
        <path d="M10 42 H62 V22 L95 50 L62 78 V58 H10 Z" fill="#FFD600" stroke="#111" strokeWidth={4} strokeLinejoin="round" />
      </svg>
    </AbsoluteFill>
  );
};
