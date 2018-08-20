import Symbol from "es6-symbol";
import mergeWith from "lodash/mergeWith";
import HTMLSerializer from "@vericus/slate-kit-html-serializer";

const CHANGES = Symbol("changes");
const OPTIONS = Symbol("options");
const PLUGINS = Symbol("plugins");
const PROPS = Symbol("props");
const STYLES = Symbol("styles");
const UTILS = Symbol("utils");
const SCHEMAS = Symbol("schema");
const RULES = Symbol("rules");

/**
 * Resolve a document rule `obj`.
 *
 * @param {Object} obj
 * @return {Object}
 */

function resolveDocumentRule(obj) {
  return {
    data: {},
    nodes: null,
    ...obj
  };
}

/**
 * Resolve a node rule with `type` from `obj`.
 *
 * @param {String} object
 * @param {String} type
 * @param {Object} obj
 * @return {Object}
 */

function resolveNodeRule(object, type, obj) {
  return {
    data: {},
    isVoid: null,
    nodes: null,
    first: null,
    last: null,
    parent: null,
    text: null,
    ...obj
  };
}

/**
 * A Lodash customizer for merging schema definitions. Special cases `objects`,
 * `marks` and `types` arrays to be unioned, and ignores new `null` values.
 *
 * @param {Mixed} target
 * @param {Mixed} source
 * @return {Array|Void}
 */

function customizer(target, source, key) {
  if (key === "objects" || key === "types" || key === "marks") {
    return target == null ? source : target.concat(source);
  }
  return source == null ? target : source;
}

function defaultSchemaCustomizer(schema, schemas) {
  const customizedSchema = schema;
  schemas.forEach(s => {
    if (!s) return;
    const { document = {}, blocks = {}, inlines = {} } = s;
    const d = resolveDocumentRule(document);
    const bs = {};
    const is = {};

    for (const [key, value] of Object.entries(blocks)) {
      bs[key] = resolveNodeRule("block", key, value);
    }

    for (const [key, value] of Object.entries(inlines)) {
      is[key] = resolveNodeRule("inline", key, value);
    }
    mergeWith(customizedSchema.document, d, customizer);
    mergeWith(customizedSchema.blocks, bs, customizer);
    mergeWith(customizedSchema.inlines, is, customizer);
  });
  return customizedSchema;
}

export interface ObjectMap {
  [label: string]: object;
}

export interface SlateKitData {
  mark?: object;
}

export interface SlateKitDatum {
  marks?: object[];
  data?: object;
}

export interface SlateKitStyle {
  getData?: (el: HTMLElement) => SlateKitData;
}

export interface SlateKitStyles {
  marks?: object[];
}

export interface StylesMap {
  [label: string]: SlateKitStyle;
}

export interface RulesMap {
  [label: string]: () => void;
}

export interface SlateKitProps {
  getProps?: (nodeProps: object) => object;
}

export interface PropsMap {
  [label: string]: SlateKitProps;
}

export default class PluginsWrapper {
  serializer: null | object;
  schema: object;
  schemaCustomizer: (schema: object, schemas: object[]) => object;
  CHANGES: ObjectMap;
  OPTIONS: ObjectMap;
  UTILS: ObjectMap;
  STYLES: StylesMap;
  RULES: RulesMap;
  constructor(
    { schemaCustomizer } = { schemaCustomizer: defaultSchemaCustomizer }
  ) {
    this[CHANGES] = {};
    this[OPTIONS] = {};
    this[PLUGINS] = {};
    this[PROPS] = {};
    this[STYLES] = {};
    this[UTILS] = {};
    this[SCHEMAS] = {};
    this[RULES] = {};
    this.serializer = null;
    this.schema = {
      blocks: {},
      inlines: {},
      document: {}
    };
    this.schemaCustomizer = schemaCustomizer;
  }

  getOptions = (label?: string): null | object =>
    label ? this[OPTIONS][label] : null;

  getFlattenPlugins = (
    pluginCollection: object,
    pluginLabel?: string
  ): object[] => [
    ...Object.entries(pluginCollection).reduce(
      (plugins, [label, pluginList]) => {
        if (pluginLabel && label !== pluginLabel) return plugins;
        return [...plugins, ...pluginList];
      },
      []
    ),
    { schema: this.getSchema() }
  ];

  getSchemas = (label?: string): object[] => {
    if (label) return this[SCHEMAS][label];
    return Object.entries(this[SCHEMAS]).reduce(
      (schemas: any[], [key, value]) => schemas.concat(value),
      []
    );
  };

  getSchema = () => this.schemaCustomizer(this.schema, this.getSchemas());

  getUtils = (label?: string) => (label ? this[UTILS][label] : this[UTILS]);

  getChanges = (label?: string) =>
    label ? this[CHANGES][label] : this[CHANGES];

  getPlugins = (label?: string) =>
    label
      ? this.getFlattenPlugins(this[PLUGINS], label)
      : this.getFlattenPlugins(this[PLUGINS]);

  getData = (el: HTMLElement): SlateKitDatum =>
    Object.values(this[STYLES]).reduce(
      (styles: SlateKitStyles, style: SlateKitStyle) => {
        if (style && style.getData) {
          const passData = style.getData(el);
          const marks = styles.marks || [];
          if (passData.mark) {
            return {
              ...styles,
              marks: [...marks, passData.mark]
            };
          }
          return {
            ...styles,
            ...passData
          };
        }
        return {
          ...styles
        };
      },
      {}
    );

  getProps = (nodeProps: object): object =>
    Object.values(this[PROPS]).reduce(
      (props: object, prop: SlateKitProps) => {
        if (prop && prop.getProps) {
          return {
            ...props,
            ...prop.getProps(props)
          };
        }
        return {
          ...props
        };
      },
      {
        ...nodeProps
      }
    );

  configureHelper = (
    key: string,
    value: object | (() => any),
    label: string
  ): void => {
    switch (key) {
      case "style":
        if (this[STYLES][label]) {
          this[STYLES][label] = {
            ...this[STYLES][label],
            ...value
          };
        } else {
          this[STYLES][label] = value;
        }
        break;
      case "utils":
      case "helpers":
        if (this[UTILS][label]) {
          this[UTILS][label] = {
            ...this[UTILS][label],
            ...value
          };
        } else {
          this[UTILS][label] = value;
        }
        break;
      case "changes":
        if (this[CHANGES][label]) {
          this[CHANGES][label] = {
            ...this[CHANGES][label],
            ...value
          };
        } else {
          this[CHANGES][label] = value;
        }
        break;
      case "props":
        if (this[PROPS][label]) {
          this[PROPS][label] = {
            ...this[PROPS][label],
            ...value
          };
        } else {
          this[PROPS][label] = value;
        }
        break;
      case "getSchema":
        if (typeof value !== "object") {
          if (this[SCHEMAS][label]) {
            this[SCHEMAS][label] = value();
          } else {
            this[SCHEMAS][label] = value();
          }
        }
        break;
      case "options":
        this[OPTIONS][label] = value;
        break;
      case "rules":
        this[RULES][label] = value;
        break;
      default:
        break;
    }
  };

  getSerializer = () => this.serializer;

  updateSerializer = () => {
    const rulesGenerators = Object.entries(this[RULES]).reduce(
      (acc, [label, rulesGenerator]: [string, (...args: any[]) => void]) => [
        ...acc,
        (...args) => rulesGenerator(this[OPTIONS][label], ...args)
      ],
      []
    );
    this.serializer = HTMLSerializer({
      rulesGenerators: [
        ...rulesGenerators,
        () => {
          const { getData } = this;
          return [
            {
              deserialize(el, next) {
                if (el.tagName.toLowerCase() !== "div") return undefined;
                if (
                  !el.textContent ||
                  (el.textContent && el.textContent !== "")
                ) {
                  return undefined;
                }
                const { data, marks } = getData(el);
                return {
                  object: "block",
                  data,
                  marks,
                  type: "paragraph",
                  nodes: next(el.childNodes)
                };
              }
            },
            {
              deserialize(el, next) {
                if (
                  el.parentNode &&
                  el.parentNode.parentNode &&
                  el.parentNode.parentNode.tagName.toLowerCase() === "div"
                ) {
                  return undefined;
                }
                if (
                  el.parentNode &&
                  el.parentNode.tagName.toLowerCase() === "li"
                ) {
                  return undefined;
                }
                if (el.nodeName === "#text") return undefined;
                if (
                  el.firstChild &&
                  el.firstChild.nodeName !== "#text" &&
                  el.firstChild.firstChild &&
                  el.firstChild.firstChild.nodeName !== "#text"
                ) {
                  return undefined;
                }
                if (el.firstChild && el.firstChild.nodeName === "#text") {
                  return undefined;
                }
                if (
                  !el.textContent ||
                  (el.textContent && el.textContent !== "")
                ) {
                  return undefined;
                }
                const { data, marks } = getData(el);
                return {
                  object: "block",
                  data,
                  marks,
                  type: "paragraph",
                  nodes: next(el.childNodes)
                };
              }
            }
          ];
        }
      ],
      getData: this.getData,
      getProps: this.getProps
    });
    return this.serializer;
  };

  configurePlugin = (createPlugin, options = {}, label) => {
    if (!label) return createPlugin(options, this);

    const plugin = createPlugin(options, this);
    let plugins;
    if (plugin.plugins) {
      plugins = plugin.plugins;
    } else if (plugin.plugin) {
      plugins = [plugin.plugin];
    } else {
      plugins = [plugin];
    }
    plugins.forEach(pluginEntry =>
      Object.entries(pluginEntry).forEach(([key, value]) =>
        this.configureHelper(key, value, label)
      )
    );
    this[PLUGINS][label] = plugins;
    return plugins;
  };

  addPlugin = (createPlugin, options = {}, label) => {
    this.configurePlugin(createPlugin, options, label);
    this.serializer = this.updateSerializer();
    return this.getPlugins();
  };

  removePlugin = label => {
    delete this[PLUGINS][label];
    return this.getPlugins();
  };

  makePlugins = (pluginDict = []) => {
    const plugins = [
      ...pluginDict.reduce(
        (
          acc,
          {
            label,
            createPlugin,
            options
          }: {
            label?: string;
            createPlugin: (...args: any[]) => any;
            options?: object;
          }
        ) => [...acc, ...this.configurePlugin(createPlugin, options, label)],
        []
      ),
      { schema: this.getSchema() }
    ];
    this.serializer = this.updateSerializer();
    return plugins;
  };
}