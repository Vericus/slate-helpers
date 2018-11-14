import * as React from "react";
import { Mark, Editor } from "slate";
import SlateTypes from "slate-prop-types";

export interface Props {
  mark: Mark;
  children: JSX.Element;
  attributes: any;
  className?: string;
}

const defaultStyle = {
  textDecoration: "inherit",
  textDecorationColor: "inherit"
};

const renderMark: React.SFC<Props> = ({ children, attributes, className }) => {
  return (
    <span {...attributes} className={className}>
      {children}
    </span>
  );
};

renderMark.propTypes = SlateTypes.Mark;

export function bold(props: Props) {
  return renderMark({
    ...props,
    attributes: {
      ...props.attributes,
      style: { ...defaultStyle, fontWeight: "bold" }
    }
  });
}

export function italic(props: Props) {
  return renderMark({
    ...props,
    attributes: {
      ...props.attributes,
      style: { ...defaultStyle, fontStyle: "italic" }
    }
  });
}

export function underline(props: Props) {
  return renderMark({
    ...props,
    attributes: {
      ...props.attributes,
      style: { ...defaultStyle, textDecoration: "underline" }
    }
  });
}

export function strikethrough(props: Props) {
  return renderMark({
    ...props,
    attributes: {
      ...props.attributes,
      style: { ...defaultStyle, textDecoration: "line-through" }
    }
  });
}

export default function createRenderMark() {
  const marks = {
    bold,
    italic,
    underline,
    strikethrough
  };
  return {
    onConstruct: (editor: Editor, next) => {
      Object.entries(marks).map(([type, renderer]) => {
        if (editor.registerMarkRenderer && editor.getMarkType) {
          editor.registerMarkRenderer(editor.getMarkType(type), renderer);
        }
      });
      return next();
    }
  };
}
