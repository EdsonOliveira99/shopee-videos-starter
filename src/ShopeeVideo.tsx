import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useVideoConfig } from "remotion";
import { CenaBeneficios, CenaCta, CenaGancho, CenaMidia, CenaPreco } from "./Cenas";
import { BarraProgresso, Legendas, Neve } from "./componentes/Extras";
import type { VideoProps } from "./schema";
import { montarTimeline } from "./timeline";

const src = (a: string) => (a.startsWith("http") ? a : staticFile(a));

export const ShopeeVideo: React.FC<VideoProps> = (props) => {
  const cor = props.corDestaque ?? "#EE4D2D";
  const { segmentos } = montarTimeline(props);
  const { durationInFrames, fps } = useVideoConfig();
  const volMusica = props.volumeMusica ?? (props.narracao ? 0.12 : 0.5);
  // música entra suave e sai em fade no último segundo
  const volumeMusica = (f: number) =>
    volMusica * interpolate(f, [0, 8, durationInFrames - fps, durationInFrames], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {segmentos.map((s, i) => (
        <Sequence key={i} from={s.inicio} durationInFrames={s.dur} premountFor={30}>
          {s.tipo === "gancho" && <CenaGancho midia={s.midia} broll={s.broll} dur={s.dur} texto={props.gancho} cor={cor} estilo={props.estiloCapa} selo={props.selo} />}
          {s.tipo === "midia" && (
            <CenaMidia midia={s.midia} dur={s.dur} cor={cor} base={props.posicaoTexto === "base"} zoomSaindo={props.zoomAlternado && i % 2 === 0} />
          )}
          {s.tipo === "beneficios" && (
            <CenaBeneficios midia={s.midia} dur={s.dur} itens={props.beneficios ?? []} titulo={props.nomeProduto} cor={cor} />
          )}
          {s.tipo === "preco" && <CenaPreco midia={s.midia} dur={s.dur} precoDe={props.precoDe} precoPor={props.precoPor!} cor={cor} />}
          {s.tipo === "cta" && <CenaCta midia={s.midia} dur={s.dur} texto={props.cta ?? "Toque no carrinho 🛒"} nome={props.nomeProduto} cor={cor} />}
        </Sequence>
      ))}

      {props.efeito === "neve" && <Neve />}
      {props.legendas && <Legendas legendas={props.legendas} cor={cor} />}
      <BarraProgresso cor={cor} />

      {props.narracao && props.narracaoAte == null && <Audio src={src(props.narracao)} />}
      {props.narracao && props.narracaoAte != null && <Audio src={src(props.narracao)} trimAfter={Math.round(props.narracaoAte * fps)} />}
      {props.narracaoFinal && props.narracaoAte != null && (
        <Sequence from={Math.round(props.narracaoAte * fps)}>
          <Audio src={src(props.narracaoFinal)} />
        </Sequence>
      )}
      {props.musica && <Audio src={src(props.musica)} volume={volumeMusica} loop />}
    </AbsoluteFill>
  );
};
