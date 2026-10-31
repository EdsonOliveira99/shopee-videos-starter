import { bundle } from "@remotion/bundler";
import { selectComposition, renderStill } from "@remotion/renderer";
import fs from "node:fs";
const B="/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const serveUrl = await bundle({ entryPoint: "src/index.ts" });
const ids=process.argv.slice(2);
for (const id of ids){
  const c = await selectComposition({ serveUrl, id, browserExecutable:B });
  const fr=[0, 100, Math.round(c.durationInFrames*0.45), Math.round(c.durationInFrames*0.7), c.durationInFrames-30];
  for (const [i,f] of fr.entries()) await renderStill({ serveUrl, composition:c, frame:f, output:`../previas/${id}-${i}.jpg`, imageFormat:"jpeg", jpegQuality:70, browserExecutable:B, scale:0.33 });
  console.log(id, c.durationInFrames);
}
