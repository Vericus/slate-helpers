/** @jsx h */
import h from "@vericus/slate-kit-utils-hyperscript";

export default function (editor) {
  return editor.canBeIndented();
}

export const input = (
  <value>
    <document>
      <paragraph indentation={8}>
        <anchor />
        <b>word</b>
      </paragraph>
      <paragraph indentation={8}>
        <focus />
        <b>word</b>
      </paragraph>
    </document>
  </value>
);

export const output = false;
