import type jsPDF from "jspdf"

export type Constraints = {
  maxWidth: number
  maxHeight?: number
}

export type Size = {
  width: number
  height: number
}

/** Contexto de pintura: caixa do widget em mm (origem topo-esquerdo, Y para baixo). */
export type PaintContext = {
  doc: jsPDF
  x: number
  y: number
  width: number
  height: number
}

export type EdgeInsets = {
  top: number
  right: number
  bottom: number
  left: number
}

export function edgeInsetsAll(value: number): EdgeInsets {
  return { top: value, right: value, bottom: value, left: value }
}

export function edgeInsetsSymmetric(opts: {
  vertical?: number
  horizontal?: number
}): EdgeInsets {
  const v = opts.vertical ?? 0
  const h = opts.horizontal ?? 0
  return { top: v, right: h, bottom: v, left: h }
}

export function deflateConstraints(
  c: Constraints,
  padding: EdgeInsets
): Constraints {
  const maxWidth = Math.max(0, c.maxWidth - padding.left - padding.right)
  const maxHeight =
    c.maxHeight !== undefined
      ? Math.max(0, c.maxHeight - padding.top - padding.bottom)
      : undefined
  return maxHeight !== undefined ? { maxWidth, maxHeight } : { maxWidth }
}
