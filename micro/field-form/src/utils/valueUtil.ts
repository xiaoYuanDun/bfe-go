import { NamePath, InternalNamePath } from '../interface';
import { toArray } from './typeUtil';

export function getNamePath(path: NamePath | null): InternalNamePath {
  return toArray(path);
}
