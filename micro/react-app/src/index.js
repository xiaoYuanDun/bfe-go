import React from './react'
import ReactDom from 'react-dom'

const element = React.createElement('h1', {
  className: 'title',
  style: {
    color: 'red'
  }
}, 'hello', React.createElement('span', null, 'world'))

console.log(element)

// ReactDom.render(element, document.getElementById('root'))