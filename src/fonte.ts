import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Fonte Montserrat salva localmente em public/fontes (funciona offline)
export const fontFamily = "Montserrat";

for (const peso of ["600", "800", "900"]) {
  loadFont({
    family: fontFamily,
    url: staticFile(`fontes/montserrat-latin-${peso}-normal.woff2`),
    weight: peso,
  });
}
