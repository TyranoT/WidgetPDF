/** RGB 0–255 — espelha cores do app (PDF não usa Tailwind). */
export type Rgb = readonly [number, number, number]

/** Alinhamento no eixo principal (vertical em Column, horizontal em Row). */
export type MainAxisAlignment =
  | "start"
  | "center"
  | "end"
  | "spaceBetween"
  | "spaceAround"

/** Alinhamento no eixo cruzado (horizontal em Column, vertical em Row). */
export type CrossAxisAlignment = "start" | "center" | "end" | "stretch"

/** Cores aproximadas de `app/globals.css` (--cor-detalhes, --cor-base, --cor-auxiliar). */
export const PDF_THEME = {
  detalhes: [150, 17, 13] as const satisfies Rgb,
  base: [238, 238, 238] as const satisfies Rgb,
  auxiliar: [0, 0, 0] as const satisfies Rgb,
} as const
