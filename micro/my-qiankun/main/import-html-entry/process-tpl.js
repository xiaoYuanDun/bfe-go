import { getInlineCode } from './utils';

// 一些关键字开头的，表示明确规定的协议名
function hasProtocol(url) {
  return (
    url.startsWith('//') ||
    url.startsWith('http://') ||
    url.startsWith('https://')
  );
}

function getEntirePath(path, baseURI) {
  return new URL(path, baseURI).toString();
}

// 把原始 HTML 中的所有 CSS 外链全部剔除，并添加相应的 link注释
// match    ---->  '<link href="style-b15343fe.css" rel="stylesheet">'
// href     ---->  'style-b15343fe.css'
// newHref  ---->  'http://localhost:3002/style-b15343fe.css'
//
// replaced ---->  '<!--  link http://localhost:3002/style-b15343fe.css replaced by import-html-entry -->'
export const genLinkReplaceSymbol = (linkHref, preloadOrPrefetch = false) =>
  `<!-- ${
    preloadOrPrefetch ? 'prefetch/preload' : ''
  } link ${linkHref} replaced by import-html-entry -->`;

// 把原始 HTML 中的所有 JS 外链全部剔除，并添加相应的 script注释
export const genScriptReplaceSymbol = (scriptSrc, async = false) =>
  `<!-- ${
    async ? 'async' : ''
  } script ${scriptSrc} replaced by import-html-entry -->`;

// 行内 JS 标识
export const inlineScriptReplaceSymbol = `<!-- inline scripts replaced by import-html-entry -->`;

const HTML_COMMENT_REGEX = /<!--([\s\S]*?)-->/g;
const LINK_TAG_REGEX = /<(link)\s+.*?>/gis;
const STYLE_TYPE_REGEX = /\s+rel=('|")?stylesheet\1.*/;
const STYLE_HREF_REGEX = /.*\shref=('|")?([^>'"\s]+)/; // /.*\shref=("|')(.?*)\1.*/g 这是自己的正则
const STYLE_TAG_REGEX = /<style[^>]*>[\s\S]*?<\/style>/gi;
const ALL_SCRIPT_REGEX = /(<script[\s\S]*?>)[\s\S]*?<\/script>/gi;
const SCRIPT_TAG_REGEX =
  /<(script)\s+((?!type=('|")text\/ng-template\3).)*?>.*?<\/\1>/is;
const SCRIPT_SRC_REGEX = /.*\ssrc=('|")?([^>'"\s]+)/;
const SCRIPT_ENTRY_REGEX = /.*\sentry\s*.*/;
const SCRIPT_ASYNC_REGEX = /.*\sasync\s*.*/;

/**
 * 这个方法用来对请求到的 html 字符串做一些处理
 *   1. 删除 HTML 中的注释部分
 *   2. 收集外链 CSS 的请求地址 至 styles[]，删除 link，在对用位置插入自定义外联CSS注释
 *   3. 收集外链 JS 的请求地址，是否异步 至 scripts[]，删除 script，在对应位置插入自定义外联JS注释
 *   4. 收集内联 JS 的代码块 至 scripts[]，删除 script，在对应位置插入自定义行内JS注释
 *
 * 最终返回，处理后的最新 HTML 字符串，styles[], scripts[]
 */
export default function processTpl(tpl, baseURI) {
  const scripts = [];
  const styles = [];
  let entry = null;

  const template = tpl
    // 剔除注释
    .replace(HTML_COMMENT_REGEX, '')

    // 提取 CSS 外链信息，并添加注释
    .replace(LINK_TAG_REGEX, (match) => {
      const styleType = !!match.match(STYLE_TYPE_REGEX);

      if (styleType) {
        const styleHref = match.match(STYLE_HREF_REGEX);

        if (styleHref) {
          const href = styleHref && styleHref[2];
          let newHref = href;

          if (href && !hasProtocol(href)) {
            newHref = getEntirePath(href, baseURI); // 没有协议名的外链，基于子应用配置地址和相对路径构造一个
          }

          styles.push(newHref); // 收集每一个处理过后 CSS 外链
          return genLinkReplaceSymbol(newHref);
        }
      }
      return match;
    })

    // todo，内联样式的处理，暂时不做任何处理，STYLE_IGNORE_REGEX 意义不明
    .replace(STYLE_TAG_REGEX, (match) => {
      //   if (STYLE_IGNORE_REGEX.test(match)) {
      //     return genIgnoreAssetReplaceSymbol('style file');
      //   }
      return match;
    })

    // script 标签的处理
    .replace(ALL_SCRIPT_REGEX, (match, scriptTag) => {
      if (SCRIPT_TAG_REGEX.test(match) && scriptTag.match(SCRIPT_SRC_REGEX)) {
        // 如果是 外链JS，收集 src async 信息，并生成对应注释

        // const matchedScriptEntry = scriptTag.match(SCRIPT_ENTRY_REGEX);
        const matchedScriptSrcMatch = scriptTag.match(SCRIPT_SRC_REGEX);

        let matchedScriptSrc =
          matchedScriptSrcMatch && matchedScriptSrcMatch[2];

        if (matchedScriptSrc && !hasProtocol(matchedScriptSrc)) {
          matchedScriptSrc = getEntirePath(matchedScriptSrc, baseURI); // 没有协议名的外链，基于子应用配置地址和相对路径构造一个
        }
        // entry = entry || (matchedScriptEntry && matchedScriptSrc);

        if (matchedScriptSrc) {
          // todo，这里异步脚步还有可能是 defer，为什么不判断呢？
          const asyncScript = !!scriptTag.match(SCRIPT_ASYNC_REGEX);
          scripts.push(
            asyncScript
              ? { async: true, src: matchedScriptSrc }
              : matchedScriptSrc
          );
          return genScriptReplaceSymbol(matchedScriptSrc, asyncScript);
        }
        return match;
      } else {
        // 如果是行内 JS 代码块，
        const code = getInlineCode(match);
        scripts.push(code);
        return inlineScriptReplaceSymbol;
      }
    });

  // 删除空串
  scripts = scripts.filter((script) => !!script);

  const tplResult = {
    template,
    scripts,
    styles,
  };

  // 外部可干预 tpl 结果的一个 hook，最后的修改机会
  if (typeof postProcessTemplate === 'function') {
    tplResult = postProcessTemplate(tplResult);
  }

  return tplResult;
}
