import { Change, SlateError, Block, Text } from "slate";
import { TypeOption, CommonOption } from "../options";

export default function createSchema(opts: TypeOption) {
  const { type, mediaTypes, captionType } = opts;
  return {
    blocks: {
      [type]: {
        nodes: [
          {
            match: Object.values(mediaTypes).map((mediaType: CommonOption) => ({
              type: mediaType.type
            })),
            min: 1
          },
          {
            match: { type: captionType },
            min: 0
          }
        ],
        first: Object.values(mediaTypes).map((mediaType: CommonOption) => ({
          type: mediaType.type
        })),
        normalize: (change: Change, error: SlateError) => {
          switch (error.code) {
            case "first_child_type_invalid":
              change.removeNodeByKey(error.node.key);
              return;
            case "child_required":
              change.removeNodeByKey(error.node.key);
              return;
            case "child_unknown":
              change.removeNodeByKey(error.child.key);
              return;
          }
        }
      },
      [captionType]: {
        parent: { type },
        nodes: [{ match: { object: "text", min: 1 } }],
        normalize: (change: Change, error: SlateError) => {
          switch (error.code) {
            case "parent_type_invalid":
              change.removeNodeByKey(error.node.key);
              return;
            case "child_object_invalid":
              change.removeNodeByKey(error.child.key);
              return;
            case "child_required":
              change.insertNodeByKey(error.node.key, 0, Text.create(""));
              return;
          }
        }
      },
      ...Object.values(mediaTypes).reduce(
        (acc: object, mediaType: CommonOption) => ({
          ...acc,
          [mediaType.type]: {
            parent: { type },
            isVoid: true,
            data: Object.keys(mediaType).reduce((data, mediaField) => {
              const match = mediaField.match(/(.*)Field/);
              if (match) {
                const dataField = match.length >= 1 ? match[1] : undefined;
                if (
                  dataField &&
                  mediaType[mediaField] &&
                  mediaType[`${dataField}Options`] &&
                  Array.isArray(mediaType[`${dataField}Options`])
                ) {
                  return {
                    ...data,
                    [mediaType[mediaField]]: value =>
                      mediaType[`${dataField}Options`].includes(value)
                  };
                }
              }
              return data;
            }, {}),
            normalize: (change: Change, error: SlateError) => {
              switch (error.code) {
                case "parent_type_invalid":
                  change.wrapBlockByKey(error.node.key, type);
                  return;
                case "node_data_invalid":
                  const { key, node } = error;
                  const defaultKey = `default${key.replace(/\w/, c =>
                    c.toUpperCase()
                  )}`;
                  if (
                    mediaType[`${key}Options`] &&
                    mediaType[defaultKey] &&
                    Block.isBlock(node)
                  ) {
                    change.setNodeByKey(node.key, {
                      data: node.data.set(key, mediaType[defaultKey])
                    });
                  }
                  return;
              }
            }
          }
        }),
        {}
      )
    }
  };
}