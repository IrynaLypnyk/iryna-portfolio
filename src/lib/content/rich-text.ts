// Keep the stored format independent of the editor and render only supported nodes.
const PREFIX = 'richtext:v1:';

export type RichTextNode = {
  type: string;
  text?: string;
  marks?: { type: string }[];
  attrs?: { start?: number };
  content?: RichTextNode[];
};

function validNode(value: unknown, depth = 0): value is RichTextNode {
  if (depth > 20 || !value || typeof value !== 'object') return false;
  const node = value as RichTextNode;
  if (node.type === 'text') {
    return (
      typeof node.text === 'string' &&
      (!node.marks ||
        (Array.isArray(node.marks) && node.marks.every((mark) => mark?.type === 'bold')))
    );
  }
  if (node.type === 'hardBreak') return true;
  const children: Record<string, string[]> = {
    doc: ['paragraph', 'bulletList', 'orderedList'],
    paragraph: ['text', 'hardBreak'],
    bulletList: ['listItem'],
    orderedList: ['listItem'],
    listItem: ['paragraph', 'bulletList', 'orderedList'],
  };
  const allowed = Object.hasOwn(children, node.type) ? children[node.type] : undefined;
  return (
    !!allowed &&
    (!node.attrs?.start || (Number.isSafeInteger(node.attrs.start) && node.attrs.start > 0)) &&
    (node.content === undefined ||
      (Array.isArray(node.content) &&
        node.content.every((child) => validNode(child, depth + 1) && allowed.includes(child.type))))
  );
}

export function readRichText(value: string): RichTextNode {
  if (value.startsWith(PREFIX)) {
    try {
      const doc: unknown = JSON.parse(value.slice(PREFIX.length));
      if (validNode(doc) && doc.type === 'doc') return doc;
    } catch {
      /* Treat malformed or legacy values as text, never HTML. */
    }
  }
  return {
    type: 'doc',
    content: value
      .split(/\r?\n\s*\r?\n/)
      .filter((part) => part.trim())
      .map((part) => ({
        type: 'paragraph',
        content: part
          .split(/\r?\n/)
          .flatMap((line, index) => [
            ...(index ? [{ type: 'hardBreak' }] : []),
            ...(line ? [{ type: 'text', text: line }] : []),
          ]),
      })),
  };
}

export function writeRichText(doc: RichTextNode): string {
  if (!validNode(doc) || doc.type !== 'doc') throw new Error('Unsupported rich text content.');
  const hasText = (node: RichTextNode): boolean =>
    !!node.text?.trim() || !!node.content?.some(hasText);
  return hasText(doc) ? PREFIX + JSON.stringify(doc) : '';
}
