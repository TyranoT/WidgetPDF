"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  PDF_THEME: () => PDF_THEME,
  PdfColumn: () => PdfColumn,
  PdfContainer: () => PdfContainer,
  PdfDocumentBuilder: () => PdfDocumentBuilder,
  PdfHtmlPreview: () => PdfHtmlPreview,
  PdfPadding: () => PdfPadding,
  PdfRow: () => PdfRow,
  PdfSizedBox: () => PdfSizedBox,
  PdfText: () => PdfText,
  PdfWidget: () => PdfWidget,
  crossAxisToAlignItems: () => crossAxisToAlignItems,
  deflateConstraints: () => deflateConstraints,
  edgeInsetsAll: () => edgeInsetsAll,
  edgeInsetsSymmetric: () => edgeInsetsSymmetric,
  edgeInsetsToCssPadding: () => edgeInsetsToCssPadding,
  mainAxisToJustifyContent: () => mainAxisToJustifyContent,
  marginsAll: () => marginsAll,
  measureTextBlock: () => measureTextBlock,
  rgbToCss: () => rgbToCss
});
module.exports = __toCommonJS(index_exports);

// src/pdf_document_builder.ts
var import_jspdf = __toESM(require("jspdf"));
var import_react = require("react");
function marginsAll(value) {
  return { top: value, right: value, bottom: value, left: value };
}
var PdfDocumentBuilder = class {
  constructor(root, options = {}) {
    this.root = root;
    this.options = options;
  }
  build() {
    const m = this.options.margins ?? marginsAll(14);
    const doc = new import_jspdf.default({
      unit: "mm",
      format: this.options.format ?? "a4",
      orientation: this.options.orientation ?? "p"
    });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const constraints = {
      maxWidth: pageW - m.left - m.right,
      maxHeight: pageH - m.top - m.bottom
    };
    const size = this.root.layout(doc, constraints);
    this.root.paint({
      doc,
      x: m.left,
      y: m.top,
      width: size.width,
      height: size.height
    });
    return doc;
  }
  save(filename) {
    this.build().save(filename);
  }
  /**
   * Pré-visualização em HTML (React) com mesma árvore de widgets e dimensões da página em mm.
   * Use em TSX: `{builder.toHtmlPreview()}` ou o componente `PdfHtmlPreview`.
   */
  toHtmlPreview() {
    const m = this.options.margins ?? marginsAll(14);
    const doc = new import_jspdf.default({
      unit: "mm",
      format: this.options.format ?? "a4",
      orientation: this.options.orientation ?? "p"
    });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const maxW = pageW - m.left - m.right;
    const maxH = pageH - m.top - m.bottom;
    return (0, import_react.createElement)(
      "div",
      {
        style: {
          width: `${pageW}mm`,
          minHeight: `${pageH}mm`,
          padding: `${m.top}mm ${m.right}mm ${m.bottom}mm ${m.left}mm`,
          boxSizing: "border-box",
          background: "#fff",
          color: "#000"
        }
      },
      this.root.toHtml({ maxWidthMm: maxW, maxHeightMm: maxH })
    );
  }
};

// src/pdf_widgets.ts
var import_react2 = require("react");

// src/pdf_html_preview.ts
function rgbToCss(rgb) {
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}
function edgeInsetsToCssPadding(p) {
  return `${p.top}mm ${p.right}mm ${p.bottom}mm ${p.left}mm`;
}
function mainAxisToJustifyContent(main) {
  switch (main) {
    case "start":
      return "flex-start";
    case "center":
      return "center";
    case "end":
      return "flex-end";
    case "spaceBetween":
      return "space-between";
    case "spaceAround":
      return "space-around";
  }
}
function crossAxisToAlignItems(cross) {
  switch (cross) {
    case "start":
      return "flex-start";
    case "center":
      return "center";
    case "end":
      return "flex-end";
    case "stretch":
      return "stretch";
  }
}

// src/pdf_constraints.ts
function edgeInsetsAll(value) {
  return { top: value, right: value, bottom: value, left: value };
}
function edgeInsetsSymmetric(opts) {
  const v = opts.vertical ?? 0;
  const h = opts.horizontal ?? 0;
  return { top: v, right: h, bottom: v, left: h };
}
function deflateConstraints(c, padding) {
  const maxWidth = Math.max(0, c.maxWidth - padding.left - padding.right);
  const maxHeight = c.maxHeight !== void 0 ? Math.max(0, c.maxHeight - padding.top - padding.bottom) : void 0;
  return maxHeight !== void 0 ? { maxWidth, maxHeight } : { maxWidth };
}

// src/pdf_widgets.ts
var LINE_HEIGHT_FACTOR = 0.3528;
function measureTextBlock(doc, text, maxWidth, fontSizePt) {
  doc.setFontSize(fontSizePt);
  const lines = doc.splitTextToSize(text, maxWidth);
  const lineHeightMm = fontSizePt * LINE_HEIGHT_FACTOR;
  const height = lines.length * lineHeightMm;
  let width = 0;
  for (const line of lines) {
    const w = doc.getTextDimensions(line).w;
    if (w > width) width = w;
  }
  return { lines, width: Math.min(width, maxWidth), height };
}
var PdfWidget = class {
};
var PdfText = class extends PdfWidget {
  constructor(text, opts = {}) {
    super();
    this.text = text;
    this.opts = opts;
  }
  layout(doc, constraints) {
    const fontSize = this.opts.fontSize ?? 12;
    doc.setFont("helvetica", this.opts.fontStyle ?? "normal");
    const { width, height } = measureTextBlock(
      doc,
      this.text,
      constraints.maxWidth,
      fontSize
    );
    return { width, height };
  }
  paint(ctx) {
    const { doc, x, y, width } = ctx;
    const fontSize = this.opts.fontSize ?? 12;
    doc.setFont("helvetica", this.opts.fontStyle ?? "normal");
    doc.setFontSize(fontSize);
    if (this.opts.color) {
      doc.setTextColor(this.opts.color[0], this.opts.color[1], this.opts.color[2]);
    } else {
      doc.setTextColor(0, 0, 0);
    }
    const { lines } = measureTextBlock(doc, this.text, width, fontSize);
    const lineHeight = fontSize * LINE_HEIGHT_FACTOR;
    const firstBaseline = y + fontSize * LINE_HEIGHT_FACTOR;
    let cy = firstBaseline;
    for (const line of lines) {
      doc.text(line, x, cy);
      cy += lineHeight;
    }
  }
  toHtml(options) {
    const fontSize = this.opts.fontSize ?? 12;
    const fontStyle = this.opts.fontStyle ?? "normal";
    return (0, import_react2.createElement)(
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
          boxSizing: "border-box"
        }
      },
      this.text
    );
  }
};
var PdfSizedBox = class extends PdfWidget {
  constructor(opts) {
    super();
    this.opts = opts;
  }
  layout(doc, constraints) {
    const { width: w, height: h, child } = this.opts;
    if (!child) {
      return { width: w ?? 0, height: h ?? 0 };
    }
    const inner = {
      maxWidth: w !== void 0 ? Math.min(constraints.maxWidth, w) : constraints.maxWidth,
      maxHeight: h !== void 0 && constraints.maxHeight !== void 0 ? Math.min(constraints.maxHeight, h) : h ?? constraints.maxHeight
    };
    const childSize = child.layout(doc, inner);
    return {
      width: w !== void 0 ? w : childSize.width,
      height: h !== void 0 ? h : childSize.height
    };
  }
  paint(ctx) {
    const { child } = this.opts;
    if (!child) return;
    const { doc, x, y, width, height } = ctx;
    child.paint({ doc, x, y, width, height });
  }
  toHtml(options) {
    const { width: w, height: h, child } = this.opts;
    if (!child) {
      return (0, import_react2.createElement)("div", {
        style: {
          width: w !== void 0 ? `${w}mm` : void 0,
          height: h !== void 0 ? `${h}mm` : void 0,
          flexShrink: 0,
          boxSizing: "border-box"
        }
      });
    }
    return (0, import_react2.createElement)(
      "div",
      {
        style: {
          width: w !== void 0 ? `${w}mm` : "100%",
          height: h !== void 0 ? `${h}mm` : void 0,
          maxWidth: `${options.maxWidthMm}mm`,
          boxSizing: "border-box",
          minWidth: 0
        }
      },
      child.toHtml({
        maxWidthMm: w !== void 0 ? Math.min(options.maxWidthMm, w) : options.maxWidthMm,
        maxHeightMm: h !== void 0 && options.maxHeightMm !== void 0 ? Math.min(options.maxHeightMm, h) : h ?? options.maxHeightMm
      })
    );
  }
};
var PdfPadding = class extends PdfWidget {
  constructor(padding, child) {
    super();
    this.padding = padding;
    this.child = child;
  }
  layout(doc, constraints) {
    const inner = deflateConstraints(constraints, this.padding);
    const s = this.child.layout(doc, inner);
    return {
      width: s.width + this.padding.left + this.padding.right,
      height: s.height + this.padding.top + this.padding.bottom
    };
  }
  paint(ctx) {
    const { doc, x, y, width, height } = ctx;
    const p = this.padding;
    const inner = deflateConstraints({ maxWidth: width, maxHeight: height }, p);
    const childSize = this.child.layout(doc, inner);
    this.child.paint({
      doc,
      x: x + p.left,
      y: y + p.top,
      width: childSize.width,
      height: childSize.height
    });
  }
  toHtml(options) {
    const p = this.padding;
    const inner = {
      maxWidthMm: Math.max(0, options.maxWidthMm - p.left - p.right),
      maxHeightMm: options.maxHeightMm !== void 0 ? Math.max(0, options.maxHeightMm - p.top - p.bottom) : void 0
    };
    return (0, import_react2.createElement)(
      "div",
      {
        style: {
          padding: `${p.top}mm ${p.right}mm ${p.bottom}mm ${p.left}mm`,
          boxSizing: "border-box",
          width: "100%",
          maxWidth: `${options.maxWidthMm}mm`
        }
      },
      this.child.toHtml(inner)
    );
  }
};
var PdfContainer = class extends PdfWidget {
  constructor(opts) {
    super();
    this.opts = opts;
  }
  get padding() {
    return this.opts.padding ?? edgeInsetsAll(0);
  }
  layout(doc, constraints) {
    const inner = deflateConstraints(constraints, this.padding);
    const s = this.opts.child.layout(doc, inner);
    const p = this.padding;
    return {
      width: s.width + p.left + p.right,
      height: s.height + p.top + p.bottom
    };
  }
  paint(ctx) {
    const { doc, x, y, width, height } = ctx;
    const p = this.padding;
    const dec = this.opts.decoration;
    if (dec) {
      const fill = dec.fillColor;
      const stroke = dec.strokeColor;
      const r = dec.borderRadius ?? 0;
      const lw = dec.lineWidth ?? 0.2;
      if (fill) doc.setFillColor(fill[0], fill[1], fill[2]);
      if (stroke) {
        doc.setDrawColor(stroke[0], stroke[1], stroke[2]);
        doc.setLineWidth(lw);
      }
      const mode = fill && stroke ? "FD" : fill ? "F" : stroke ? "S" : "S";
      if (r > 0 && (fill || stroke)) {
        doc.roundedRect(x, y, width, height, r, r, mode);
      } else if (fill || stroke) {
        doc.rect(x, y, width, height, mode);
      }
    }
    const inner = deflateConstraints({ maxWidth: width, maxHeight: height }, p);
    const childSize = this.opts.child.layout(doc, inner);
    this.opts.child.paint({
      doc,
      x: x + p.left,
      y: y + p.top,
      width: childSize.width,
      height: childSize.height
    });
  }
  toHtml(options) {
    const p = this.padding;
    const dec = this.opts.decoration;
    const inner = {
      maxWidthMm: Math.max(0, options.maxWidthMm - p.left - p.right),
      maxHeightMm: options.maxHeightMm !== void 0 ? Math.max(0, options.maxHeightMm - p.top - p.bottom) : void 0
    };
    const style = {
      padding: `${p.top}mm ${p.right}mm ${p.bottom}mm ${p.left}mm`,
      boxSizing: "border-box",
      width: "100%",
      maxWidth: `${options.maxWidthMm}mm`,
      height: "fit-content",
      maxHeight: options.maxHeightMm !== void 0 ? `${options.maxHeightMm}mm` : void 0,
      overflow: options.maxHeightMm !== void 0 ? "auto" : void 0
    };
    if (dec) {
      if (dec.fillColor) style.backgroundColor = rgbToCss(dec.fillColor);
      if (dec.strokeColor) {
        style.borderColor = rgbToCss(dec.strokeColor);
        style.borderStyle = "solid";
        style.borderWidth = `${dec.lineWidth ?? 0.2}mm`;
      }
      if (dec.borderRadius !== void 0 && dec.borderRadius > 0) {
        style.borderRadius = `${dec.borderRadius}mm`;
      }
    }
    return (0, import_react2.createElement)("div", { style }, this.opts.child.toHtml(inner));
  }
};
function mainAxisGaps(free, n, alignment) {
  if (n <= 0 || free <= 0) {
    return { leading: 0, betweenExtra: 0, trailing: 0 };
  }
  switch (alignment) {
    case "start":
      return { leading: 0, betweenExtra: 0, trailing: 0 };
    case "center":
      return { leading: free / 2, betweenExtra: 0, trailing: free / 2 };
    case "end":
      return { leading: free, betweenExtra: 0, trailing: 0 };
    case "spaceBetween":
      return n > 1 ? { leading: 0, betweenExtra: free / (n - 1), trailing: 0 } : { leading: free / 2, betweenExtra: 0, trailing: free / 2 };
    case "spaceAround": {
      const g = free / (n + 1);
      return { leading: g, betweenExtra: g, trailing: g };
    }
  }
}
function crossAxisOffset(containerSize, childSize, cross) {
  switch (cross) {
    case "start":
    case "stretch":
      return 0;
    case "center":
      return (containerSize - childSize) / 2;
    case "end":
      return containerSize - childSize;
    default:
      return 0;
  }
}
var PdfColumn = class extends PdfWidget {
  constructor(opts) {
    super();
    this.opts = opts;
  }
  compute(doc, constraints) {
    const children = this.opts.children;
    const spacing = this.opts.spacing ?? 0;
    const main = this.opts.mainAxisAlignment ?? "start";
    const cross = this.opts.crossAxisAlignment ?? "start";
    const maxW = constraints.maxWidth;
    const maxH = constraints.maxHeight;
    const sizes = [];
    for (const child of children) {
      const cw = cross === "stretch" ? { maxWidth: maxW, maxHeight: maxH } : { maxWidth: maxW, maxHeight: maxH };
      sizes.push(child.layout(doc, cw));
    }
    const maxChildW = sizes.reduce((a, s) => Math.max(a, s.width), 0);
    const colW = cross === "stretch" ? maxW : Math.min(maxW, maxChildW);
    const intrinsicH = sizes.reduce((a, s) => a + s.height, 0) + (children.length > 1 ? spacing * (children.length - 1) : 0);
    const availableH = maxH !== void 0 ? maxH : intrinsicH;
    const freeV = Math.max(0, availableH - intrinsicH);
    const { leading, betweenExtra, trailing } = mainAxisGaps(
      freeV,
      children.length,
      main
    );
    const placements = [];
    let y = leading;
    for (let i = 0; i < children.length; i++) {
      const s = sizes[i];
      const w = cross === "stretch" ? colW : s.width;
      const xOff = crossAxisOffset(colW, s.width, cross);
      placements.push({
        x: xOff,
        y,
        width: w,
        height: s.height
      });
      y += s.height;
      if (i < children.length - 1) {
        y += spacing + betweenExtra;
      }
    }
    const totalH = y + trailing;
    return {
      size: { width: colW, height: totalH },
      placements
    };
  }
  layout(doc, constraints) {
    return this.compute(doc, constraints).size;
  }
  paint(ctx) {
    const { doc, x, y, width, height } = ctx;
    const { placements } = this.compute(doc, {
      maxWidth: width,
      maxHeight: height
    });
    const children = this.opts.children;
    for (let i = 0; i < children.length; i++) {
      const p = placements[i];
      children[i].paint({
        doc,
        x: x + p.x,
        y: y + p.y,
        width: p.width,
        height: p.height
      });
    }
  }
  toHtml(options) {
    const spacing = this.opts.spacing ?? 0;
    const main = this.opts.mainAxisAlignment ?? "start";
    const cross = this.opts.crossAxisAlignment ?? "start";
    const children = this.opts.children;
    const childMaxW = options.maxWidthMm;
    return (0, import_react2.createElement)(
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
          maxHeight: options.maxHeightMm !== void 0 ? `${options.maxHeightMm}mm` : void 0,
          overflow: options.maxHeightMm !== void 0 ? "auto" : void 0
        }
      },
      children.map(
        (child, i) => (0, import_react2.createElement)(
          import_react2.Fragment,
          { key: i },
          child.toHtml({
            maxWidthMm: childMaxW,
            maxHeightMm: void 0
          })
        )
      )
    );
  }
};
var PdfRow = class extends PdfWidget {
  constructor(opts) {
    super();
    this.opts = opts;
  }
  compute(doc, constraints) {
    const children = this.opts.children;
    const spacing = this.opts.spacing ?? 0;
    const main = this.opts.mainAxisAlignment ?? "start";
    const cross = this.opts.crossAxisAlignment ?? "start";
    const maxW = constraints.maxWidth;
    const maxH = constraints.maxHeight;
    const sizes = [];
    for (const child of children) {
      const ch = cross === "stretch" && maxH !== void 0 ? { maxWidth: maxW, maxHeight: maxH } : { maxWidth: maxW, maxHeight: maxH };
      sizes.push(child.layout(doc, ch));
    }
    const maxChildH = sizes.reduce((a, s) => Math.max(a, s.height), 0);
    const rowH = cross === "stretch" && maxH !== void 0 ? maxH : maxChildH;
    const intrinsicW = sizes.reduce((a, s) => a + s.width, 0) + (children.length > 1 ? spacing * (children.length - 1) : 0);
    const availableW = maxW;
    const freeW = Math.max(0, availableW - intrinsicW);
    const { leading, betweenExtra, trailing } = mainAxisGaps(
      freeW,
      children.length,
      main
    );
    const placements = [];
    let x = leading;
    for (let i = 0; i < children.length; i++) {
      const s = sizes[i];
      const h = cross === "stretch" ? rowH : s.height;
      const yOff = crossAxisOffset(rowH, s.height, cross);
      placements.push({
        x,
        y: yOff,
        width: s.width,
        height: h
      });
      x += s.width;
      if (i < children.length - 1) {
        x += spacing + betweenExtra;
      }
    }
    const totalW = x + trailing;
    return {
      size: { width: totalW, height: rowH },
      placements
    };
  }
  layout(doc, constraints) {
    return this.compute(doc, constraints).size;
  }
  paint(ctx) {
    const { doc, x, y, width, height } = ctx;
    const { placements } = this.compute(doc, {
      maxWidth: width,
      maxHeight: height
    });
    const children = this.opts.children;
    for (let i = 0; i < children.length; i++) {
      const p = placements[i];
      children[i].paint({
        doc,
        x: x + p.x,
        y: y + p.y,
        width: p.width,
        height: p.height
      });
    }
  }
  toHtml(options) {
    const spacing = this.opts.spacing ?? 0;
    const main = this.opts.mainAxisAlignment ?? "start";
    const cross = this.opts.crossAxisAlignment ?? "start";
    const children = this.opts.children;
    const childMaxH = cross === "stretch" && options.maxHeightMm !== void 0 ? options.maxHeightMm : void 0;
    return (0, import_react2.createElement)(
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
          maxHeight: options.maxHeightMm !== void 0 ? `${options.maxHeightMm}mm` : void 0,
          overflow: options.maxHeightMm !== void 0 ? "auto" : void 0
        }
      },
      children.map(
        (child, i) => (0, import_react2.createElement)(
          import_react2.Fragment,
          { key: i },
          child.toHtml({
            maxWidthMm: options.maxWidthMm,
            maxHeightMm: childMaxH
          })
        )
      )
    );
  }
};

// src/type.ts
var PDF_THEME = {
  detalhes: [150, 17, 13],
  base: [238, 238, 238],
  auxiliar: [0, 0, 0]
};

// src/render_component.tsx
var import_jsx_runtime = require("react/jsx-runtime");
function PdfHtmlPreview(props) {
  const { root, className, ...opts } = props;
  const inner = new PdfDocumentBuilder(root, opts).toHtmlPreview();
  if (!className) return inner;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className, "data-pdf-html-preview": true, children: inner });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PDF_THEME,
  PdfColumn,
  PdfContainer,
  PdfDocumentBuilder,
  PdfHtmlPreview,
  PdfPadding,
  PdfRow,
  PdfSizedBox,
  PdfText,
  PdfWidget,
  crossAxisToAlignItems,
  deflateConstraints,
  edgeInsetsAll,
  edgeInsetsSymmetric,
  edgeInsetsToCssPadding,
  mainAxisToJustifyContent,
  marginsAll,
  measureTextBlock,
  rgbToCss
});
