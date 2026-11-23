import { Fragment, type ReactNode } from 'react';
import { readRichText, type RichTextNode } from '@/lib/content/rich-text';

function renderNode(node: RichTextNode, key: number): ReactNode {
  const children = node.content?.map(renderNode);
  switch (node.type) {
    case 'text':
      return node.marks?.some((mark) => mark.type === 'bold') ? (
        <strong key={key} className="font-semibold">
          {node.text}
        </strong>
      ) : (
        <Fragment key={key}>{node.text}</Fragment>
      );
    case 'hardBreak':
      return <br key={key} />;
    case 'paragraph':
      return (
        <p key={key} className="min-h-[1lh] whitespace-pre-wrap">
          {children}
        </p>
      );
    case 'bulletList':
      return (
        <ul key={key} role="list" className="list-disc space-y-3 pl-6">
          {children}
        </ul>
      );
    case 'orderedList':
      return (
        <ol
          key={key}
          role="list"
          start={node.attrs?.start ?? 1}
          className="list-decimal space-y-3 pl-6"
        >
          {children}
        </ol>
      );
    case 'listItem':
      return (
        <li key={key} className="space-y-2 pl-1">
          {children}
        </li>
      );
    default:
      return <Fragment key={key}>{children}</Fragment>;
  }
}

export function CaseBody({ body }: { body: string }) {
  return (
    <div className="text-app-text grid max-w-200 gap-3.5 text-base leading-normal text-pretty">
      {readRichText(body).content?.map(renderNode)}
    </div>
  );
}
