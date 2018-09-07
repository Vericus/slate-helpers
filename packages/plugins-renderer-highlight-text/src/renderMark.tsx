import * as React from "react";
import { Mark } from "slate";

export interface Props {
  mark: Mark;
  children: JSX.Element;
  attributes: any;
}

export default function createRenderMark(type) {
  return {
    marks: {
      [type]: (props: Props) => {
        const { attributes, children } = props;
        return <span {...attributes}>{children}</span>;
      }
    }
  };
}
