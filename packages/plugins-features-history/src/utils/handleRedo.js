// @flow
import type { Value, Change } from "slate";
import hasRedo from "./hasRedo";

export default function handleRedo(
  value: Value,
  editorChange: ?Change,
  onRedo: (change: Change) => void
) {
  const change = editorChange || value.change();
  const newChange = change.value.change();
  if (!hasRedo(value)) return change;
  value.history.redos.some(redo => {
    if (onRedo && typeof onRedo === "function") {
      newChange.redo();
    } else {
      change.redo();
    }
    if (redo.size === 1 && redo.get(0).type === "set_selection") {
      return false;
    }
    return true;
  });
  if (onRedo && typeof onRedo === "function") {
    onRedo(newChange);
  }
  return onRedo ? change : newChange;
}
