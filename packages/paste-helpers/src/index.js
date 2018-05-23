import genericClean from "./generic";
import wordClean, { isWordHTML } from "./microsoft-word";
import googleDocsClean, { isGoogleDocsHTML } from "./google-docs";

export default function pasteCleaner(html) {
  if (isWordHTML(html)) {
    return { origin: "word", cleanedHTML: wordClean(html) };
  } else if (isGoogleDocsHTML(html)) {
    return { origin: "docs", cleanedHTML: googleDocsClean(html) };
  }
  return { origin: "generic", cleanedHTML: genericClean(html) };
}