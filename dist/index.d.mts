import jsPDF from 'jspdf';
import { CSSProperties, ReactNode } from 'react';

/** RGB 0–255 — espelha cores do app (PDF não usa Tailwind). */
type Rgb = readonly [number, number, number];
/** Alinhamento no eixo principal (vertical em Column, horizontal em Row). */
type MainAxisAlignment = "start" | "center" | "end" | "spaceBetween" | "spaceAround";
/** Alinhamento no eixo cruzado (horizontal em Column, vertical em Row). */
type CrossAxisAlignment = "start" | "center" | "end" | "stretch";
/** Cores aproximadas de `app/globals.css` (--cor-detalhes, --cor-base, --cor-auxiliar). */
declare const PDF_THEME: {
    readonly detalhes: readonly [150, 17, 13];
    readonly base: readonly [238, 238, 238];
    readonly auxiliar: readonly [0, 0, 0];
};

type Constraints = {
    maxWidth: number;
    maxHeight?: number;
};
type Size = {
    width: number;
    height: number;
};
/** Contexto de pintura: caixa do widget em mm (origem topo-esquerdo, Y para baixo). */
type PaintContext = {
    doc: jsPDF;
    x: number;
    y: number;
    width: number;
    height: number;
};
type EdgeInsets = {
    top: number;
    right: number;
    bottom: number;
    left: number;
};
declare function edgeInsetsAll(value: number): EdgeInsets;
declare function edgeInsetsSymmetric(opts: {
    vertical?: number;
    horizontal?: number;
}): EdgeInsets;
declare function deflateConstraints(c: Constraints, padding: EdgeInsets): Constraints;

/**
 * Opções para pré-visualização em HTML/TSX (unidades em mm, alinhado ao layout do PDF).
 */
type HtmlPreviewOptions = {
    maxWidthMm: number;
    maxHeightMm?: number;
};
declare function rgbToCss(rgb: Rgb): string;
declare function edgeInsetsToCssPadding(p: EdgeInsets): string;
declare function mainAxisToJustifyContent(main: MainAxisAlignment): NonNullable<CSSProperties["justifyContent"]>;
declare function crossAxisToAlignItems(cross: CrossAxisAlignment): NonNullable<CSSProperties["alignItems"]>;

declare function measureTextBlock(doc: jsPDF, text: string, maxWidth: number, fontSizePt: number): {
    lines: string[];
    width: number;
    height: number;
};
declare abstract class PdfWidget {
    abstract layout(doc: jsPDF, constraints: Constraints): Size;
    abstract paint(ctx: PaintContext): void;
    /** Pré-visualização em HTML (TSX) espelhando a árvore; unidades em mm. */
    abstract toHtml(options: HtmlPreviewOptions): ReactNode;
}
type PdfDecoration = {
    fillColor?: Rgb;
    strokeColor?: Rgb;
    borderRadius?: number;
    lineWidth?: number;
};
declare class PdfText extends PdfWidget {
    private readonly text;
    private readonly opts;
    constructor(text: string, opts?: {
        fontSize?: number;
        fontStyle?: "normal" | "bold" | "italic";
        color?: Rgb;
    });
    layout(doc: jsPDF, constraints: Constraints): Size;
    paint(ctx: PaintContext): void;
    toHtml(options: HtmlPreviewOptions): ReactNode;
}
declare class PdfSizedBox extends PdfWidget {
    private readonly opts;
    constructor(opts: {
        width?: number;
        height?: number;
        child?: PdfWidget;
    });
    layout(doc: jsPDF, constraints: Constraints): Size;
    paint(ctx: PaintContext): void;
    toHtml(options: HtmlPreviewOptions): ReactNode;
}
declare class PdfPadding extends PdfWidget {
    private readonly padding;
    private readonly child;
    constructor(padding: EdgeInsets, child: PdfWidget);
    layout(doc: jsPDF, constraints: Constraints): Size;
    paint(ctx: PaintContext): void;
    toHtml(options: HtmlPreviewOptions): ReactNode;
}
declare class PdfContainer extends PdfWidget {
    private readonly opts;
    constructor(opts: {
        padding?: EdgeInsets;
        decoration?: PdfDecoration;
        child: PdfWidget;
    });
    private get padding();
    layout(doc: jsPDF, constraints: Constraints): Size;
    paint(ctx: PaintContext): void;
    toHtml(options: HtmlPreviewOptions): ReactNode;
}
declare class PdfColumn extends PdfWidget {
    private readonly opts;
    constructor(opts: {
        children: PdfWidget[];
        spacing?: number;
        mainAxisAlignment?: MainAxisAlignment;
        crossAxisAlignment?: CrossAxisAlignment;
    });
    private compute;
    layout(doc: jsPDF, constraints: Constraints): Size;
    paint(ctx: PaintContext): void;
    toHtml(options: HtmlPreviewOptions): ReactNode;
}
declare class PdfRow extends PdfWidget {
    private readonly opts;
    constructor(opts: {
        children: PdfWidget[];
        spacing?: number;
        mainAxisAlignment?: MainAxisAlignment;
        crossAxisAlignment?: CrossAxisAlignment;
    });
    private compute;
    layout(doc: jsPDF, constraints: Constraints): Size;
    paint(ctx: PaintContext): void;
    toHtml(options: HtmlPreviewOptions): ReactNode;
}

type PdfMargins = {
    top: number;
    right: number;
    bottom: number;
    left: number;
};
declare function marginsAll(value: number): PdfMargins;
/**
 * Monta um `jsPDF` a partir de uma árvore de widgets (layout em duas fases).
 * Conteúdo longo pode ultrapassar a página — quebra automática não está no MVP.
 */
declare class PdfDocumentBuilder {
    private readonly root;
    private readonly options;
    constructor(root: PdfWidget, options?: {
        margins?: PdfMargins;
        orientation?: "p" | "portrait" | "l" | "landscape";
        format?: string | [number, number];
    });
    build(): jsPDF;
    save(filename: string): void;
    /**
     * Pré-visualização em HTML (React) com mesma árvore de widgets e dimensões da página em mm.
     * Use em TSX: `{builder.toHtmlPreview()}` ou o componente `PdfHtmlPreview`.
     */
    toHtmlPreview(): ReactNode;
}

declare function PdfHtmlPreview(props: {
    root: PdfWidget;
    margins?: PdfMargins;
    orientation?: "p" | "portrait" | "l" | "landscape";
    format?: string | [number, number];
    className?: string;
}): ReactNode;

export { type Constraints, type CrossAxisAlignment, type EdgeInsets, type HtmlPreviewOptions, type MainAxisAlignment, PDF_THEME, type PaintContext, PdfColumn, PdfContainer, type PdfDecoration, PdfDocumentBuilder, PdfHtmlPreview, type PdfMargins, PdfPadding, PdfRow, PdfSizedBox, PdfText, PdfWidget, type Rgb, type Size, crossAxisToAlignItems, deflateConstraints, edgeInsetsAll, edgeInsetsSymmetric, edgeInsetsToCssPadding, mainAxisToJustifyContent, marginsAll, measureTextBlock, rgbToCss };
