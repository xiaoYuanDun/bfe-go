import processTpl, { genLinkReplaceSymbol } from './process-tpl';
import {
  defaultGetPublicPath,
  defaultGetTemplate,
  readResAsString,
  getInlineCode,
} from './utils';

// 同一个请求地址的 html 字符串被缓存在此
const embedHTMLCache = {};

const styleCache = {};

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

// 默认使用浏览器的 fetch 请求资源
// 不存在，需要手动添加 polyfill，否则退出执行，也可以在方法中添加自定义 fetch 方法
if (!window.fetch) {
  throw new Error(
    '[import-html-entry] Here is no "fetch" on the window env, you need to polyfill it'
  );
}
const defaultFetch = window.fetch.bind(window);

// 把外链 CSS 处理为内联样式
function getEmbedHTML(template, styles, fetch = defaultFetch) {
  let embedHTML = template;
  return getExternalStyleSheets(styles, fetch).then((styleSheets) => {
    console.log('styleSheets', styleSheets);
    embedHTML = styles.reduce((html, styleSrc, i) => {
      html = html.replace(
        genLinkReplaceSymbol(styleSrc), // 这里 genLinkReplaceSymbol 和 process-tpl 是对应的，保证替换到正确的位置
        `<style>/* ${styleSrc} */${styleSheets[i]}</style>`
      );
      return html;
    }, embedHTML);
    return embedHTML;
  });
}

const isInlineCode = (code) => code.startsWith('<');

// for prefetch
export function getExternalStyleSheets(styles, fetch = defaultFetch) {
  return Promise.all(
    styles.map((styleLink) => {
      // 行内直接返回内部样式字符串
      if (isInlineCode(styleLink)) return getInlineCode(styleLink);
      // external styles
      return (
        styleCache[styleLink] ||
        (styleCache[styleLink] = fetch(styleLink).then((response) =>
          response.text()
        ))
      );
    })
  );
}

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

/**
 * qiankun 和 single-spa 一个区别是：qiankun 可以直接引用子应用的 html 资源，而 single-spa 只能引用 js 资源
 *
 * qiankun 是如果做到这一点的呢？
 * 答案是: 'import-html-entry', 这是处理 html 的关键，内部处理了 html 引用的 css, js 等额外资源
 *
 * 最终，
 *   所有的样式都会被处理为内联样式
 *
 */
export function importEntry(entry, opts = {}) {
  const { fetch, getTemplate, getPublicPath } = opts;

  if (!entry) {
    throw new SyntaxError('entry[子应用访问地址] should not be empty!');
  }

  // html entry, 一般是字符串形式的访问地址，如: "//localhost:3001"
  if (typeof entry === 'string') {
    return importHTML(entry, {
      fetch,
      getTemplate,
      getPublicPath,
    });
  }
}

export function importHTML(url, opts = {}) {
  const fetch = opts.fetch || defaultFetch;
  const getTemplate = opts.getTemplate || defaultGetTemplate;
  const getPublicPath = opts.getPublicPath || defaultGetPublicPath;

  return (
    embedHTMLCache[url] ||
    (embedHTMLCache[url] = fetch(url)
      .then((response) => readResAsString(response))
      .then((html) => {
        const assetPublicPath = getPublicPath(url);
        const { template, scripts, styles } = processTpl(
          getTemplate(html),
          assetPublicPath
        );

        // 这里已经处理好了所有的 CSS
        return getEmbedHTML(template, styles, fetch).then((embedHTML) => ({
          template: embedHTML,
          assetPublicPath,
        }));
      }))
  );
}
