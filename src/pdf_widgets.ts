import type jsPDF from "jspdf"
import {
    createElement,
    Fragment,
    type CSSProperties,
    type ReactNode,
} from "react"
import type { CrossAxisAlignment, MainAxisAlignment, Rgb } from "./type"
import {
    crossAxisToAlignItems,
    mainAxisToJustifyContent,
    rgbToCss,
    type HtmlPreviewOptions,
} from "./pdf_html_preview"
import {
    type Constraints,
    type EdgeInsets,
    type PaintContext,
    type Size,
    deflateConstraints,
    edgeInsetsAll,
} from "./pdf_constraints"

/** Altura de linha em relação ao tamanho da fonte (pt) para cálculo em mm. */
const LINE_HEIGHT_FACTOR = 0.3528

export function measureTextBlock(
    doc: jsPDF,
    text: string,
    maxWidth: number,
    fontSizePt: number
): { lines: string[]; width: number; height: number } {
    doc.setFontSize(fontSizePt)
    const lines = doc.splitTextToSize(text, maxWidth) as string[]
    const lineHeightMm = fontSizePt * LINE_HEIGHT_FACTOR
    const height = lines.length * lineHeightMm
    let width = 0
    for (const line of lines) {
        const w = doc.getTextDimensions(line).w
        if (w > width) width = w
    }
    return { lines, width: Math.min(width, maxWidth), height }
}

export abstract class PdfWidget {
    abstract layout(doc: jsPDF, constraints: Constraints): Size

    abstract paint(ctx: PaintContext): void

    /** Pré-visualização em HTML (TSX) espelhando a árvore; unidades em mm. */
    abstract toHtml(options: HtmlPreviewOptions): ReactNode
}

export type PdfDecoration = {
    fillColor?: Rgb
    strokeColor?: Rgb
    borderRadius?: number
    lineWidth?: number
}

export class PdfText extends PdfWidget {
    constructor(
        private readonly text: string,
        private readonly opts: {
            fontSize?: number
            fontStyle?: "normal" | "bold" | "italic"
            color?: Rgb
        } = {}
    ) {
        super()
    }

    layout(doc: jsPDF, constraints: Constraints): Size {
        const fontSize = this.opts.fontSize ?? 12
        doc.setFont("helvetica", this.opts.fontStyle ?? "normal")
        const { width, height } = measureTextBlock(
            doc,
            this.text,
            constraints.maxWidth,
            fontSize
        )
        return { width, height }
    }

    paint(ctx: PaintContext): void {
        const { doc, x, y, width } = ctx
        const fontSize = this.opts.fontSize ?? 12
        doc.setFont("helvetica", this.opts.fontStyle ?? "normal")
        doc.setFontSize(fontSize)
        if (this.opts.color) {
            doc.setTextColor(this.opts.color[0], this.opts.color[1], this.opts.color[2])
        } else {
            doc.setTextColor(0, 0, 0)
        }
        const { lines } = measureTextBlock(doc, this.text, width, fontSize)
        const lineHeight = fontSize * LINE_HEIGHT_FACTOR
        const firstBaseline = y + fontSize * LINE_HEIGHT_FACTOR
        let cy = firstBaseline
        for (const line of lines) {
            doc.text(line, x, cy)
            cy += lineHeight
        }
    }

    toHtml(options: HtmlPreviewOptions): ReactNode {
        const fontSize = this.opts.fontSize ?? 12
        const fontStyle = this.opts.fontStyle ?? "normal"
        return createElement(
            "div",
            {
                style: {
                    fontFamily: "helvetica, Arial, sans-serif",
                    fontSize: `${fontSize}pt`,
                    fontWeight: fontStyle === "bold" ? 700 : 400,
                    fontStyle: fontStyle === "italic" ? "italic" : "normal",
                    color: this.opts.color ? rgbToCss(this.opts.color) : "#000",
                    maxWidth: `${options.maxWidthMm}mm`,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    boxSizing: "border-box",
                },
            },
            this.text
        )
    }
}

export class PdfSizedBox extends PdfWidget {
    constructor(
        private readonly opts: {
            width?: number
            height?: number
            child?: PdfWidget
        }
    ) {
        super()
    }

    layout(doc: jsPDF, constraints: Constraints): Size {
        const { width: w, height: h, child } = this.opts
        if (!child) {
            return { width: w ?? 0, height: h ?? 0 }
        }
        const inner: Constraints = {
            maxWidth: w !== undefined ? Math.min(constraints.maxWidth, w) : constraints.maxWidth,
            maxHeight:
                h !== undefined && constraints.maxHeight !== undefined
                    ? Math.min(constraints.maxHeight, h)
                    : h ?? constraints.maxHeight,
        }
        const childSize = child.layout(doc, inner)
        return {
            width: w !== undefined ? w : childSize.width,
            height: h !== undefined ? h : childSize.height,
        }
    }

    paint(ctx: PaintContext): void {
        const { child } = this.opts
        if (!child) return
        const { doc, x, y, width, height } = ctx
        child.paint({ doc, x, y, width, height })
    }

    toHtml(options: HtmlPreviewOptions): ReactNode {
        const { width: w, height: h, child } = this.opts
        if (!child) {
            return createElement("div", {
                style: {
                    width: w !== undefined ? `${w}mm` : undefined,
                    height: h !== undefined ? `${h}mm` : undefined,
                    flexShrink: 0,
                    boxSizing: "border-box",
                },
            })
        }
        return createElement(
            "div",
            {
                style: {
                    width: w !== undefined ? `${w}mm` : "100%",
                    height: h !== undefined ? `${h}mm` : undefined,
                    maxWidth: `${options.maxWidthMm}mm`,
                    boxSizing: "border-box",
                    minWidth: 0,
                },
            },
            child.toHtml({
                maxWidthMm:
                    w !== undefined ? Math.min(options.maxWidthMm, w) : options.maxWidthMm,
                maxHeightMm:
                    h !== undefined && options.maxHeightMm !== undefined
                        ? Math.min(options.maxHeightMm, h)
                        : (h ?? options.maxHeightMm),
            })
        )
    }
}

export class PdfPadding extends PdfWidget {
    constructor(
        private readonly padding: EdgeInsets,
        private readonly child: PdfWidget
    ) {
        super()
    }

    layout(doc: jsPDF, constraints: Constraints): Size {
        const inner = deflateConstraints(constraints, this.padding)
        const s = this.child.layout(doc, inner)
        return {
            width: s.width + this.padding.left + this.padding.right,
            height: s.height + this.padding.top + this.padding.bottom,
        }
    }

    paint(ctx: PaintContext): void {
        const { doc, x, y, width, height } = ctx
        const p = this.padding
        const inner = deflateConstraints({ maxWidth: width, maxHeight: height }, p)
        const childSize = this.child.layout(doc, inner)
        this.child.paint({
            doc,
            x: x + p.left,
            y: y + p.top,
            width: childSize.width,
            height: childSize.height,
        })
    }

    toHtml(options: HtmlPreviewOptions): ReactNode {
        const p = this.padding
        const inner: HtmlPreviewOptions = {
            maxWidthMm: Math.max(0, options.maxWidthMm - p.left - p.right),
            maxHeightMm:
                options.maxHeightMm !== undefined
                    ? Math.max(0, options.maxHeightMm - p.top - p.bottom)
                    : undefined,
        }
        return createElement(
            "div",
            {
                style: {
                    padding: `${p.top}mm ${p.right}mm ${p.bottom}mm ${p.left}mm`,
                    boxSizing: "border-box",
                    width: "100%",
                    maxWidth: `${options.maxWidthMm}mm`,
                },
            },
            this.child.toHtml(inner)
        )
    }
}

export class PdfContainer extends PdfWidget {
    constructor(
        private readonly opts: {
            padding?: EdgeInsets
            decoration?: PdfDecoration
            child: PdfWidget
        }
    ) {
        super()
    }

    private get padding(): EdgeInsets {
        return this.opts.padding ?? edgeInsetsAll(0)
    }

    layout(doc: jsPDF, constraints: Constraints): Size {
        const inner = deflateConstraints(constraints, this.padding)
        const s = this.opts.child.layout(doc, inner)
        const p = this.padding
        return {
            width: s.width + p.left + p.right,
            height: s.height + p.top + p.bottom,
        }
    }

    paint(ctx: PaintContext): void {
        const { doc, x, y, width, height } = ctx
        const p = this.padding
        const dec = this.opts.decoration

        if (dec) {
            const fill = dec.fillColor
            const stroke = dec.strokeColor
            const r = dec.borderRadius ?? 0
            const lw = dec.lineWidth ?? 0.2
            if (fill) doc.setFillColor(fill[0], fill[1], fill[2])
            if (stroke) {
                doc.setDrawColor(stroke[0], stroke[1], stroke[2])
                doc.setLineWidth(lw)
            }
            const mode = fill && stroke ? "FD" : fill ? "F" : stroke ? "S" : "S"
            if (r > 0 && (fill || stroke)) {
                doc.roundedRect(x, y, width, height, r, r, mode as "F" | "S" | "FD")
            } else if (fill || stroke) {
                doc.rect(x, y, width, height, mode as "F" | "S" | "FD")
            }
        }

        const inner = deflateConstraints({ maxWidth: width, maxHeight: height }, p)
        const childSize = this.opts.child.layout(doc, inner)
        this.opts.child.paint({
            doc,
            x: x + p.left,
            y: y + p.top,
            width: childSize.width,
            height: childSize.height,
        })
    }

    toHtml(options: HtmlPreviewOptions): ReactNode {
        const p = this.padding
        const dec = this.opts.decoration
        const inner: HtmlPreviewOptions = {
            maxWidthMm: Math.max(0, options.maxWidthMm - p.left - p.right),
            maxHeightMm:
                options.maxHeightMm !== undefined
                    ? Math.max(0, options.maxHeightMm - p.top - p.bottom)
                    : undefined,
        }
        const style: CSSProperties = {
            padding: `${p.top}mm ${p.right}mm ${p.bottom}mm ${p.left}mm`,
            boxSizing: "border-box",
            width: "100%",
            maxWidth: `${options.maxWidthMm}mm`,
            height: "fit-content",
            maxHeight:
                options.maxHeightMm !== undefined
                    ? `${options.maxHeightMm}mm`
                    : undefined,
            overflow: options.maxHeightMm !== undefined ? "auto" : undefined,
        }
        if (dec) {
            if (dec.fillColor) style.backgroundColor = rgbToCss(dec.fillColor)
            if (dec.strokeColor) {
                style.borderColor = rgbToCss(dec.strokeColor)
                style.borderStyle = "solid"
                style.borderWidth = `${dec.lineWidth ?? 0.2}mm`
            }
            if (dec.borderRadius !== undefined && dec.borderRadius > 0) {
                style.borderRadius = `${dec.borderRadius}mm`
            }
        }
        return createElement("div", { style }, this.opts.child.toHtml(inner))
    }
}

/** Distribui espaço livre no eixo principal (Column: vertical, Row: horizontal). */
function mainAxisGaps(
    free: number,
    n: number,
    alignment: MainAxisAlignment
): { leading: number; betweenExtra: number; trailing: number } {
    if (n <= 0 || free <= 0) {
        return { leading: 0, betweenExtra: 0, trailing: 0 }
    }
    switch (alignment) {
        case "start":
            return { leading: 0, betweenExtra: 0, trailing: 0 }
        case "center":
            return { leading: free / 2, betweenExtra: 0, trailing: free / 2 }
        case "end":
            return { leading: free, betweenExtra: 0, trailing: 0 }
        case "spaceBetween":
            return n > 1
                ? { leading: 0, betweenExtra: free / (n - 1), trailing: 0 }
                : { leading: free / 2, betweenExtra: 0, trailing: free / 2 }
        case "spaceAround": {
            const g = free / (n + 1)
            return { leading: g, betweenExtra: g, trailing: g }
        }
    }
}

function crossAxisOffset(
    containerSize: number,
    childSize: number,
    cross: CrossAxisAlignment
): number {
    switch (cross) {
        case "start":
        case "stretch":
            return 0
        case "center":
            return (containerSize - childSize) / 2
        case "end":
            return containerSize - childSize
        default:
            return 0
    }
}

export class PdfColumn extends PdfWidget {
    constructor(
        private readonly opts: {
            children: PdfWidget[]
            spacing?: number
            mainAxisAlignment?: MainAxisAlignment
            crossAxisAlignment?: CrossAxisAlignment
        }
    ) {
        super()
    }

    private compute(
        doc: jsPDF,
        constraints: Constraints
    ): {
        size: Size
        placements: { x: number; y: number; width: number; height: number }[]
    } {
        const children = this.opts.children
        const spacing = this.opts.spacing ?? 0
        const main = this.opts.mainAxisAlignment ?? "start"
        const cross = this.opts.crossAxisAlignment ?? "start"
        const maxW = constraints.maxWidth
        const maxH = constraints.maxHeight

        const sizes: Size[] = []
        for (const child of children) {
            const cw =
                cross === "stretch"
                    ? { maxWidth: maxW, maxHeight: maxH }
                    : { maxWidth: maxW, maxHeight: maxH }
            sizes.push(child.layout(doc, cw))
        }

        const maxChildW = sizes.reduce((a, s) => Math.max(a, s.width), 0)
        const colW =
            cross === "stretch" ? maxW : Math.min(maxW, maxChildW)

        const intrinsicH =
            sizes.reduce((a, s) => a + s.height, 0) +
            (children.length > 1 ? spacing * (children.length - 1) : 0)
        const availableH = maxH !== undefined ? maxH : intrinsicH
        const freeV = Math.max(0, availableH - intrinsicH)
        const { leading, betweenExtra, trailing } = mainAxisGaps(
            freeV,
            children.length,
            main
        )

        const placements: { x: number; y: number; width: number; height: number }[] =
            []
        let y = leading
        for (let i = 0; i < children.length; i++) {
            const s = sizes[i]
            const w = cross === "stretch" ? colW : s.width
            const xOff = crossAxisOffset(colW, s.width, cross)
            placements.push({
                x: xOff,
                y,
                width: w,
                height: s.height,
            })
            y += s.height
            if (i < children.length - 1) {
                y += spacing + betweenExtra
            }
        }
        const totalH = y + trailing

        return {
            size: { width: colW, height: totalH },
            placements,
        }
    }

    layout(doc: jsPDF, constraints: Constraints): Size {
        return this.compute(doc, constraints).size
    }

    paint(ctx: PaintContext): void {
        const { doc, x, y, width, height } = ctx
        const { placements } = this.compute(doc, {
            maxWidth: width,
            maxHeight: height,
        })
        const children = this.opts.children
        for (let i = 0; i < children.length; i++) {
            const p = placements[i]
            children[i].paint({
                doc,
                x: x + p.x,
                y: y + p.y,
                width: p.width,
                height: p.height,
            })
        }
    }

    toHtml(options: HtmlPreviewOptions): ReactNode {
        const spacing = this.opts.spacing ?? 0
        const main = this.opts.mainAxisAlignment ?? "start"
        const cross = this.opts.crossAxisAlignment ?? "start"
        const children = this.opts.children
        const childMaxW = options.maxWidthMm
        return createElement(
            "div",
            {
                style: {
                    display: "flex",
                    flexDirection: "column",
                    gap: `${spacing}mm`,
                    justifyContent: mainAxisToJustifyContent(main),
                    alignItems: crossAxisToAlignItems(cross),
                    width: "100%",
                    maxWidth: `${options.maxWidthMm}mm`,
                    boxSizing: "border-box",
                    maxHeight:
                        options.maxHeightMm !== undefined
                            ? `${options.maxHeightMm}mm`
                            : undefined,
                    overflow: options.maxHeightMm !== undefined ? "auto" : undefined,
                },
            },
            children.map((child, i) =>
                createElement(
                    Fragment,
                    { key: i },
                    child.toHtml({
                        maxWidthMm: childMaxW,
                        maxHeightMm: undefined,
                    })
                )
            )
        )
    }
}

export class PdfRow extends PdfWidget {
    constructor(
        private readonly opts: {
            children: PdfWidget[]
            spacing?: number
            mainAxisAlignment?: MainAxisAlignment
            crossAxisAlignment?: CrossAxisAlignment
        }
    ) {
        super()
    }

    private compute(
        doc: jsPDF,
        constraints: Constraints
    ): {
        size: Size
        placements: { x: number; y: number; width: number; height: number }[]
    } {
        const children = this.opts.children
        const spacing = this.opts.spacing ?? 0
        const main = this.opts.mainAxisAlignment ?? "start"
        const cross = this.opts.crossAxisAlignment ?? "start"
        const maxW = constraints.maxWidth
        const maxH = constraints.maxHeight

        const sizes: Size[] = []
        for (const child of children) {
            const ch =
                cross === "stretch" && maxH !== undefined
                    ? { maxWidth: maxW, maxHeight: maxH }
                    : { maxWidth: maxW, maxHeight: maxH }
            sizes.push(child.layout(doc, ch))
        }

        const maxChildH = sizes.reduce((a, s) => Math.max(a, s.height), 0)
        const rowH =
            cross === "stretch" && maxH !== undefined
                ? maxH
                : maxChildH

        const intrinsicW = sizes.reduce((a, s) => a + s.width, 0) + (children.length > 1 ? spacing * (children.length - 1) : 0);
        const availableW = maxW
        const freeW = Math.max(0, availableW - intrinsicW)
        const { leading, betweenExtra, trailing } = mainAxisGaps(
            freeW,
            children.length,
            main
        )

        const placements: { x: number; y: number; width: number; height: number }[] =
            []
        let x = leading
        for (let i = 0; i < children.length; i++) {
            const s = sizes[i]
            const h = cross === "stretch" ? rowH : s.height
            const yOff = crossAxisOffset(rowH, s.height, cross)
            placements.push({
                x,
                y: yOff,
                width: s.width,
                height: h,
            })
            x += s.width
            if (i < children.length - 1) {
                x += spacing + betweenExtra
            }
        }
        const totalW = x + trailing

        return {
            size: { width: totalW, height: rowH },
            placements,
        }
    }

    layout(doc: jsPDF, constraints: Constraints): Size {
        return this.compute(doc, constraints).size
    }

    paint(ctx: PaintContext): void {
        const { doc, x, y, width, height } = ctx
        const { placements } = this.compute(doc, {
            maxWidth: width,
            maxHeight: height,
        })
        const children = this.opts.children
        for (let i = 0; i < children.length; i++) {
            const p = placements[i]
            children[i].paint({
                doc,
                x: x + p.x,
                y: y + p.y,
                width: p.width,
                height: p.height,
            })
        }
    }

    toHtml(options: HtmlPreviewOptions): ReactNode {
        const spacing = this.opts.spacing ?? 0
        const main = this.opts.mainAxisAlignment ?? "start"
        const cross = this.opts.crossAxisAlignment ?? "start"
        const children = this.opts.children
        const childMaxH =
            cross === "stretch" && options.maxHeightMm !== undefined
                ? options.maxHeightMm
                : undefined
        return createElement(
            "div",
            {
                style: {
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "nowrap",
                    gap: `${spacing}mm`,
                    justifyContent: mainAxisToJustifyContent(main),
                    alignItems: crossAxisToAlignItems(cross),
                    width: "100%",
                    maxWidth: `${options.maxWidthMm}mm`,
                    boxSizing: "border-box",
                    maxHeight:
                        options.maxHeightMm !== undefined
                            ? `${options.maxHeightMm}mm`
                            : undefined,
                    overflow: options.maxHeightMm !== undefined ? "auto" : undefined,
                },
            },
            children.map((child, i) =>
                createElement(
                    Fragment,
                    { key: i },
                    child.toHtml({
                        maxWidthMm: options.maxWidthMm,
                        maxHeightMm: childMaxH,
                    })
                )
            )
        )
    }
}
