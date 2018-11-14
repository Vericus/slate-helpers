import { Editor } from "slate";
import Renderer from "@vericus/slate-kit-media-renderer";
import Options, { TypeOption } from "./options";
import createQueries from "./queries";
import createCommands from "./commands";
import createSchema from "./schemas";
import createOnKeyDown from "./keyDown";

export default function createPlugin(pluginOptions: Partial<TypeOption> = {}) {
  const options = Options.create(pluginOptions);
  const { blockTypes } = options;
  const queries = createQueries(options);
  const commands = createCommands(options);
  const schema = createSchema(options);
  const onKeyDown = createOnKeyDown(options);

  function onConstruct(editor: Editor, next) {
    Object.entries(blockTypes).map(([nodeName, nodeType]) => {
      editor.registerNodeMapping(nodeName, nodeType);
    });
    return next();
  }

  return [
    {
      queries,
      commands,
      schema,
      options,
      onConstruct,
      onKeyDown: options.withHandlers ? onKeyDown : undefined
    },
    ...(options.externalRenderer ? [] : Renderer(options))
  ];
}
