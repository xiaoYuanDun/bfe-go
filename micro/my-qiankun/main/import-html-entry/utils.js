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
