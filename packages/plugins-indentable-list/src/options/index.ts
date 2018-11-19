import { Record } from "immutable";

export type ListTypes = "orderedlist" | "unorderedlist" | "checklist";

export type BlockTypes = { [key in ListTypes]?: string | null };

export interface TypeOptions {
  blockTypes: BlockTypes;
  renderer?: (...args: any[]) => any;
  startAtField: string;
  checkField: string;
  withHandlers: boolean;
  label: string;
}

const defaultOptions = {
  blockTypes: {
    orderedlist: "ol-list",
    unorderedlist: "ul-list",
    checklist: "check-list"
  },
  renderer: undefined,
  startAtField: "startAt",
  checkField: "checked",
  withHandlers: true,
  label: "indentable-list"
};

class Options extends Record(defaultOptions) {
  blockTypes: BlockTypes;
  renderer: (...args: any[]) => any;
  startAtField: string;
  checkField: string;
  withHandlers: boolean;
  label: string;
}

export default Options;
