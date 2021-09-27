import { REACT_TEXT } from './constant'

export function wrapToVdom(element) {
  return typeof element === 'string' || typeof element === 'number' ? {
    type: REACT_TEXT,
    props: {
      content: element
    }
  } : element
}

/**
 * 对数据进行浅比较
 * @param {*} obj1 
 * @param {*} obj2 
 */
 export function shallowEquals(obj1, obj2) {
  if (obj1 === obj2) {
      return true
  }
  if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
      return false
  }
  let keys1 = Object.keys(obj1)
  let keys2 = Object.keys(obj2)
  if (keys1.length !== keys2.length) {
      return false
  }

  for (let key of keys1) {
      if (!obj2.hasOwnProperty(key) || obj1[key] !== obj2[key]) {
          return false
      }
    
  }
  return true
}