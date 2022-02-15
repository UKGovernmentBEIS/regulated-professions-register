import { escape } from './escape.helper';

export function formatMultilineString(text: string, classes = ''): string {
  if (!text) {
    return '';
  }

  text = santiseLineBreaks(text);

  const paragraphs = text.split('\n\n');

  const linesByParagraph = paragraphs.map((paragraph) =>
    paragraph.split('\n').map((line) => escape(line)),
  );

  const htmlLinesByParagraph = linesByParagraph.map((lines) =>
    lines.join('<br />'),
  );

  const htmlParagraphs = `<p class="${classes}">${htmlLinesByParagraph.join(
    `</p><p class="${classes}">`,
  )}</p>`;

  return htmlParagraphs;
}

function santiseLineBreaks(text: string): string {
  text = text.trim();

  text = text.replace(/(\r\n)/g, '\n');
  text = text.replace(/(\r)/g, '\n');
  text = text.replace(/(\n){2,}/g, '\n\n');

  return text;
}
