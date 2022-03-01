```ts

type GetKeyValue<Str extends string, Result extends string[] = []> = 
    Str extends `${infer First}&${infer Rest}` 
        ? [First, ...GetKeyValue<Rest, Result>]
        : [Str]

// type ArrayToUnion<Arr extends string[]> = Arr[number]

type ParesStrToObj<Str extends string> = Str extends `${infer Key}=${infer Val}` ? { [k in Key]: Val } : never

type Add<Target = {}, Origin = {}> = keyof Target extends keyof Origin 
    ? { [K in keyof Target]: [Origin[K], Target[K]] }
    : Origin & Target

type StrArrToSection<Arr extends unknown[], Res extends Record<string, any> = {}> = 
    Arr['length'] extends 0 
        ? Res
        : Arr extends [infer First, ...infer Rest]
            ? StrArrToSection<Rest, Add<ParesStrToObj<First & string>, Res>> 
            : Res

type ShowDetail<T> = {
    [K in keyof T]: T[K]
}

type ParseQueryStr<Str extends string> = ShowDetail<StrArrToSection<GetKeyValue<Str>>>

type QueryStr = 'a=1&a=2&b=3&c=4'

type Res = ParseQueryStr<QueryStr>

```