import jsPDF from "jspdf"
import { createElement, type ReactNode } from "react"
import type { PdfWidget } from "./pdf_widgets"
import type { Constraints } from "./pdf_constraints"

export type PdfMargins = {
  top: number
  right: number
  bottom: number
  left: number
}

export function marginsAll(value: number): PdfMargins {
  return { top: value, right: value, bottom: value, left: value }
}

/**
 * Monta um `jsPDF` a partir de uma árvore de widgets (layout em duas fases).
 * Conteúdo longo pode ultrapassar a página — quebra automática não está no MVP.
 */
export class PdfDocumentBuilder {
  constructor(
    private readonly root: PdfWidget,
    private readonly options: {
      margins?: PdfMargins
      orientation?: "p" | "portrait" | "l" | "landscape"
      format?: string | [number, number]
    } = {}
  ) { }

  build(): jsPDF {
    const m = this.options.margins ?? marginsAll(14)
    const doc = new jsPDF({
      unit: "mm",
      format: this.options.format ?? "a4",
      orientation: this.options.orientation ?? "p",
    })
    const pageW = doc.internal.pageSize.getWidth()
    const pageH = doc.internal.pageSize.getHeight()
    const constraints: Constraints = {
      maxWidth: pageW - m.left - m.right,
      maxHeight: pageH - m.top - m.bottom,
    }
    const size = this.root.layout(doc, constraints)
    this.root.paint({
      doc,
      x: m.left,
      y: m.top,
      width: size.width,
      height: size.height,
    })
    return doc
  }

  save(filename: string): void {
    this.build().save(filename)
  }

  /**
   * Pré-visualização em HTML (React) com mesma árvore de widgets e dimensões da página em mm.
   * Use em TSX: `{builder.toHtmlPreview()}` ou o componente `PdfHtmlPreview`.
   */
  toHtmlPreview(): ReactNode {
    const m = this.options.margins ?? marginsAll(14)
    const doc = new jsPDF({
      unit: "mm",
      format: this.options.format ?? "a4",
      orientation: this.options.orientation ?? "p",
    })
    const pageW = doc.internal.pageSize.getWidth()
    const pageH = doc.internal.pageSize.getHeight()
    const maxW = pageW - m.left - m.right
    const maxH = pageH - m.top - m.bottom
    return createElement(
      "div",
      {
        style: {
          width: `${pageW}mm`,
          minHeight: `${pageH}mm`,
          padding: `${m.top}mm ${m.right}mm ${m.bottom}mm ${m.left}mm`,
          boxSizing: "border-box",
          background: "#fff",
          color: "#000",
        },
      },
      this.root.toHtml({ maxWidthMm: maxW, maxHeightMm: maxH })
    )
  }
}
