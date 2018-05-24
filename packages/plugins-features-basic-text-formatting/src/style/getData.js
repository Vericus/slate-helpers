// @flow
import { Set } from "immutable";
import { Mark } from "slate";

const MarksTags = {
  strong: "bold",
  b: "bold",
  em: "italic",
  i: "italic",
  u: "underline",
  s: "strikethrough",
  strike: "strikethrough",
  del: "strikethrough"
};

function getFontStyleMark(fontStyle) {
  switch (fontStyle) {
    case "italic":
      return new Mark({ type: fontStyle });
    default:
      return undefined;
  }
}

function getTextDecorationMark(textDecoration) {
  switch (textDecoration) {
    case "underline":
      return new Mark({ type: "underline" });
    case "line-through":
      return new Mark({ type: "strikethrough" });
    default:
      return undefined;
  }
}

function getFontWeightMark(fontWeight) {
  if (fontWeight === "bold") {
    return new Mark({ type: "bold" });
  } else if (fontWeight > 400) {
    return new Mark({ type: "bold" });
  }
  return undefined;
}

export default function getData(el: Element) {
  let marks = new Set([]);
  const { style } = el;
  if (style) {
    const { fontStyle, textDecoration, fontWeight } = style;
    if (fontStyle) {
      const fontMark = getFontStyleMark(fontStyle);
      if (fontMark) marks = marks.add(fontMark);
    }
    if (textDecoration) {
      const decorationMark = getTextDecorationMark(textDecoration);
      if (decorationMark) marks = marks.add(decorationMark);
    }
    if (fontWeight) {
      const weightMark = getFontWeightMark(fontWeight);
      if (weightMark) marks = marks.add(weightMark);
    }
    return { marks: marks.toList() };
  }
  return {};
}
