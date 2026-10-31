import React from "react";
import { CalculateMetadataFunction, Composition, staticFile } from "remotion";
import { getAudioDurationInSeconds } from "@remotion/media-utils";
import { ShopeeVideo } from "./ShopeeVideo";
import { videoSchema, type VideoProps } from "./schema";
import { ALTURA, FPS, LARGURA, montarTimeline } from "./timeline";

// Cada arquivo .json dentro da pasta produtos/ vira um vídeo no Remotion Studio.
declare const require: {
  context: (dir: string, sub: boolean, re: RegExp) => { keys(): string[]; (k: string): VideoProps };
};
const ctx = require.context("../produtos", false, /\.json$/);
const produtos: VideoProps[] = ctx.keys().map((k) => ctx(k));

const calcular: CalculateMetadataFunction<VideoProps> = async ({ props }) => {
  let duracaoAudio: number | undefined;
  if (props.narracao) {
    const url = props.narracao.startsWith("http") ? props.narracao : staticFile(props.narracao);
    duracaoAudio = await getAudioDurationInSeconds(url);
  }
  if (props.narracaoAte != null) {
    let fim = 0;
    if (props.narracaoFinal) fim = await getAudioDurationInSeconds(props.narracaoFinal.startsWith("http") ? props.narracaoFinal : staticFile(props.narracaoFinal));
    duracaoAudio = props.narracaoAte + fim;
  }
  const final = { ...props, duracaoAudio };
  return { durationInFrames: montarTimeline(final).total, props: final };
};

export const RemotionRoot: React.FC = () => (
  <>
    {produtos.map((p) => (
      <Composition
        key={p.slug}
        id={p.slug}
        component={ShopeeVideo}
        schema={videoSchema}
        defaultProps={p}
        calculateMetadata={calcular}
        fps={FPS}
        width={LARGURA}
        height={ALTURA}
        durationInFrames={300}
      />
    ))}
  </>
);
