/**
 * 品读一下 validate-npm-package-name，学习一下大神的 code
 *
 *
 */

// 源码只依赖了一个 npm 包（builtins），用来得到 nodejs 核心模块名，这里就不安装了，暂时用一个变量来代替
const builtins = ['http', 'fs', 'path' /** more ... */];

// 一些关键字，放到预制黑名单里
const blackList = ['node_modules', 'favicon.ico'];

// npm包集合
const scopedPackagePattern = new RegExp('^(?:@([^/]+?)[/])?([^/]+?)$');

const done = (warnings, errors) => {
  const result = {
    validForNewPackages: errors.length === 0 && warnings.length === 0,
    validForOldPackages: errors.length === 0,
    warnings: warnings,
    errors: errors,
  };
  if (!result.warnings.length) delete result.warnings;
  if (!result.errors.length) delete result.errors;
  return result;
};

const validate = (name) => {
  const warnings = [];
  const errors = [];

  // 一些常规验证规则，一旦出现直接返回，不继续向下验证
  if (name === null) {
    errors.push('name cannot be null');
    return done(warnings, errors);
  }
  if (name === undefined) {
    errors.push('name cannot be undefined');
    return done(warnings, errors);
  }
  if (typeof name !== 'string') {
    errors.push('name must be a string');
    return done(warnings, errors);
  }

  // 这里开始，会尽量走完所有验证用例，并收集错误信息
  if (!name.length) {
    errors.push('name length must be greater than zero');
  }
  if (name.match(/^\./)) {
    errors.push('name cannot start with a period');
  }
  if (name.match(/^_/)) {
    errors.push('name cannot start with an underscore');
  }
  if (name.trim() !== name) {
    errors.push('name cannot contain leading or trailing spaces');
  }

  // 避开关键字
  blacklist.forEach((blacklistedName) => {
    if (name.toLowerCase() === blacklistedName) {
      errors.push(blacklistedName + ' is a blacklisted name');
    }
  });

  // core module names like http, events, util, etc
  builtins.forEach(function (builtin) {
    if (name.toLowerCase() === builtin) {
      warnings.push(builtin + ' is a core module name');
    }
  });

  // really-long-package-names-------------------------------such--length-----many---wow
  // the thisisareallyreallylongpackagenameitshouldpublishdowenowhavealimittothelengthofpackagenames-poch.
  if (name.length > 214) {
    warnings.push('name can no longer contain more than 214 characters');
  }
  // mIxeD CaSe nAMEs
  if (name.toLowerCase() !== name) {
    warnings.push('name can no longer contain capital letters');
  }

  // why? 这里调用一次 split 不是很懂，直接 test 不行
  if (/[~'!()*]/.test(name.split('/').slice(-1)[0])) {
    warnings.push('name can no longer contain special characters ("~\'!()*")');
  }
  if (encodeURIComponent(name) !== name) {
    // Maybe it's a scoped package name, like @user/package
    const nameMatch = name.match(scopedPackagePattern);
    if (nameMatch) {
      const user = nameMatch[1];
      const pkg = nameMatch[2];
      if (
        encodeURIComponent(user) === user &&
        encodeURIComponent(pkg) === pkg
      ) {
        return done(warnings, errors);
      }
    }
    errors.push('name can only contain URL-friendly characters');
  }
  return done(warnings, errors);
};

validate.scopedPackagePattern = scopedPackagePattern;

export default validate;
