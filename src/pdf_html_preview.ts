import type { CSSProperties } from "react"
import type { CrossAxisAlignment, MainAxisAlignment, Rgb } from "./type"
import type { EdgeInsets } from "./pdf_constraints"

/**
 * Opções para pré-visualização em HTML/TSX (unidades em mm, alinhado ao layout do PDF).
 */
export type HtmlPreviewOptions = {
  maxWidthMm: number
  maxHeightMm?: number
}

export function rgbToCss(rgb: Rgb): string {
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
}

export function edgeInsetsToCssPadding(p: EdgeInsets): string {
  return `${p.top}mm ${p.right}mm ${p.bottom}mm ${p.left}mm`
}

export function mainAxisToJustifyContent(
  main: MainAxisAlignment
): NonNullable<CSSProperties["justifyContent"]> {
  switch (main) {
    case "start":
      return "flex-start"
    case "center":
      return "center"
    case "end":
      return "flex-end"
    case "spaceBetween":
      return "space-between"
    case "spaceAround":
      return "space-around"
  }
}

export function crossAxisToAlignItems(
  cross: CrossAxisAlignment
): NonNullable<CSSProperties["alignItems"]> {
  switch (cross) {
    case "start":
      return "flex-start"
    case "center":
      return "center"
    case "end":
      return "flex-end"
    case "stretch":
      return "stretch"
  }
}
