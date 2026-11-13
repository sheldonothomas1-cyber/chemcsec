import katex from 'katex';
import 'katex/contrib/mhchem';
import 'katex/dist/katex.min.css';

const cache = new Map<string, string>();

/** Typeset one chemical formula or equation (mhchem syntax) to HTML. */
export function chemHtml(src: string): string {
  let html = cache.get(src);
  if (html === undefined) {
    try {
      html = katex.renderToString(`\\ce{${src}}`, { throwOnError: false });
    } catch {
      html = src;
    }
    cache.set(src, html);
  }
  return html;
}

/** Text in which [[H2O]] or [[2H2 + O2 -> 2H2O]] is typeset as chemistry. */
export function Rich({ text }: { text: string }) {
  const parts = text.split(/\[\[(.+?)\]\]/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 ? <span key={i} dangerouslySetInnerHTML={{ __html: chemHtml(part) }} /> : part,
      )}
    </>
  );
}
