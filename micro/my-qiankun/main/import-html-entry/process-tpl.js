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

// 把原始 HTML 中的所有 CSS 外链全部剔除，并添加相应的 注释link
// match    ---->  '<link href="style-b15343fe.css" rel="stylesheet">'
// href     ---->  'style-b15343fe.css'
// newHref  ---->  'http://localhost:3002/style-b15343fe.css'
//
// replaced ---->  '<!--  link http://localhost:3002/style-b15343fe.css replaced by import-html-entry -->'
export const genLinkReplaceSymbol = (linkHref, preloadOrPrefetch = false) =>
  `<!-- ${
    preloadOrPrefetch ? 'prefetch/preload' : ''
  } link ${linkHref} replaced by import-html-entry -->`;

export const genScriptReplaceSymbol = (scriptSrc, async = false) =>
  `<!-- ${
    async ? 'async' : ''
  } script ${scriptSrc} replaced by import-html-entry -->`;

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
 *
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
      // 如果是 外链JS，收集
      if (SCRIPT_TAG_REGEX.test(match) && scriptTag.match(SCRIPT_SRC_REGEX)) {
        /*
           collect scripts and replace the ref
          */
        const matchedScriptEntry = scriptTag.match(SCRIPT_ENTRY_REGEX);
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
        // if (scriptIgnore) {
        //         return genIgnoreAssetReplaceSymbol('js file');
        //     }
        //     if (moduleScriptIgnore) {
        //         return genModuleScriptReplaceSymbol('js file', moduleSupport);
        //     }
        //     // if it is an inline script
        //     const code = getInlineCode(match);
        //     // remove script blocks when all of these lines are comments.
        //     const isPureCommentBlock = code.split(/[\r\n]+/).every(line => !line.trim() || line.trim().startsWith('//'));
        //     if (!isPureCommentBlock) {
        //         scripts.push(match);
        //     }
        //     return inlineScriptReplaceSymbol;
      }
    });

  console.log('tpl', tpl);
  console.log('template', template);
}
