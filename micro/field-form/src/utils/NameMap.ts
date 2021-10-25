import { InternalNamePath } from '../interface';

const SPLIT = '__@field_split__';

/**
 * Convert name path into string to fast the fetch speed of Map.
 * TODO, 如何测试响应时间的???
 */
function normalize(namePath: InternalNamePath): string {
  return (
    namePath
      .map(cell => `${typeof cell}:${cell}`)
      // Magic split
      .join(SPLIT)
  );
}

class NameMap<T> {
  private kvs = new Map<string, T>();

  public set(key: InternalNamePath, value: T) {
    this.kvs.set(normalize(key), value);
  }

  public get(key: InternalNamePath) {
    return this.kvs.get(normalize(key));
  }

  public delete(key: InternalNamePath) {
    this.kvs.delete(normalize(key));
  }
}

export default NameMap;
