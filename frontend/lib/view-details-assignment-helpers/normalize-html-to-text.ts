export const normalizeHtmlToText = (value?: string | null) => {
  if (!value) {
    return '';
  }

  const htmlWithBreaks = value
    .replace(/<br\s*\/?>(\s*)/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n');

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return htmlWithBreaks
      .replace(/<[^>]*>/g, '')
      .replace(/\u00a0/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  const tempNode = document.createElement('div');
  tempNode.innerHTML = htmlWithBreaks;

  return (tempNode.textContent ?? '')
    .replace(/\u00a0/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};
