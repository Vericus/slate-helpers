import { Record } from "immutable";

export interface TypeOptions {
  tabable: string[];
  indentable: string[];
  maxIndentation: number;
  dataField: string;
  withHandlers: boolean;
}

const defaultOptions = {
  tabable: [
    "paragraph",
    "heading-one",
    "heading-two",
    "heading-three",
    "heading-four"
  ],
  indentable: [
    "paragraph",
    "heading-one",
    "heading-two",
    "heading-three",
    "heading-four",
    "ol-list",
    "ul-list",
    "check-list"
  ],
  maxIndentation: 8,
  dataField: "indentation",
  withHandlers: true
};

class Options extends Record(defaultOptions) {
  tabable: string[];
  indentable: string[];
  maxIndentation: number;
  dataField: string;
  withHandlers: boolean;
}

export default Options;
