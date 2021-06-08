### class 是什么
JS实际上是没有支持 class 这种语法的，这只是 ES6 新增的语法糖，底层还是会转变为 function


### 把 class 转换成 function 写法

```js
class Person {
  constructor(name) {
    this.name = name
  }
  
  sayWord() {
    console.log('hi, my name is ', this.name)
  }
}

// -------- 转换后 --------

function Person(name) {5
  this.name = name
}

Person.prototype.sayWord = function () {
  console.log('hi, my name is ', this.name)
}
```

```js

function Human(sex) {
  this.sex = sex
}

function Person(sex, name) {
  Human.call(this, sex)
  this.name = name
}

Person.prototype = Human.prototype

```