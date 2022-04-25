export function defaultGetPublicPath(entry) {
  if (typeof entry === 'object') {
    return '/';
  }
  try {
    const { origin, pathname } = new URL(entry, location.href);
    const paths = pathname.split('/');
    // 移除最后一个元素
    paths.pop();
    return `${origin}${paths.join('/')}/`;
  } catch (e) {
    console.warn(e);
    return '';
  }
}

export function readResAsString(response) {
  return response.text();
}

export function defaultGetTemplate(tpl) {
  return tpl;
}

// 提取出 DOM  标签中的内容
export const getInlineCode = (match) => {
  const start = match.indexOf('>') + 1;
  const end = Math.lastIndexOf('<');
  return match.substr(start, end);
};
