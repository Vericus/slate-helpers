import { Change, Block } from "slate";
import { TypeOptions } from "../options";

export default function createSchema(opts: TypeOptions) {
  const { indentable, dataField, maxIndentation } = opts;
  return {
    blocks: indentable.reduce(
      (acc: any[], block) => ({
        ...acc,
        [block]: {
          data: {
            [dataField]: indentation =>
              !indentation ||
              (indentation && indentation <= maxIndentation && indentation >= 0)
          },
          normalize: (change: Change, error) => {
            if (error.code === "node_data_invalid") {
              const data = error.node.data.get(dataField);
              if (typeof data !== "number" || data < 0) {
                change.withoutNormalizing(c =>
                  c.setNodeByKey(error.node.key, {
                    data: error.node.data.delete(dataField)
                  })
                );
              } else {
                change.withoutNormalizing(c =>
                  c.setNodeByKey(error.node.key, {
                    data: error.node.data.set(dataField, maxIndentation)
                  })
                );
              }
            }
          }
        }
      }),
      {}
    )
  };
}