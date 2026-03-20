import { ReactNode } from "react"
import { PdfDocumentBuilder, PdfMargins } from "./pdf_document_builder"
import { PdfWidget } from "./pdf_widgets"

export function PdfHtmlPreview(props: {
    root: PdfWidget
    margins?: PdfMargins
    orientation?: "p" | "portrait" | "l" | "landscape"
    format?: string | [number, number]
    className?: string
}): ReactNode {
    const { root, className, ...opts } = props
    const inner = new PdfDocumentBuilder(root, opts).toHtmlPreview()
    if (!className) return inner
    return (
        <div className={className} data-pdf-html-preview >
            {inner}
        </div >
    )
}