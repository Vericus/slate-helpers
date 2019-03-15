/** @jsx h */
import h from "@vericus/slate-kit-utils-hyperscript";

export default function(editor) {
  editor.insertDefault();
}

export const input = (
  <value>
    <document>
      <paragraph>
        <cursor />
        word
      </paragraph>
    </document>
  </value>
);

export const output = (
  <value>
    <document>
      <paragraph>
        <cursor />
      </paragraph>
      <paragraph>word</paragraph>
    </document>
  </value>
);