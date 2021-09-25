import { NAMESPACE_SEP } from './constants'

function prefix(obj, namespace) { // { namespace/key: () => {} }
    return Object.keys(obj).reduce((memo, key) => {
        memo[`${namespace}${NAMESPACE_SEP}${key}`] = obj[key]
        return memo
    }, {})
}

export default function prefixNamespace(model) {
    if (model.reducers) {
        model.reducers = prefix(model.reducers, model.namespace)
    }
    if (model.effects) {
        model.effects = prefix(model.effects, model.namespace)
    }
    return model
}