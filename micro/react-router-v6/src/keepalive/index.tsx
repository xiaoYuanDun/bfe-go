import React from 'react'
import ReactDOM from 'react-dom'
import { Switch, BrowserRouter, Link, Route } from 'react-router-dom'

import aliveKeeper from './aliveKeeper'
import AliveProvider from './aliveProvider'

const Home = () => {
  return <div>首页</div>
}
const List = () => (
  <div style={{ height: '400px', overflow: 'auto' }}>
    {new Array(20).fill(0).map((_, index) => (
      <p key={index}>{index}</p>
    ))}
  </div>
)

const Add = () => (
  <div>
    <input />
    this is input.
  </div>
)

const HomeKeeper = aliveKeeper(Home, 'home')
const ListKeeper = aliveKeeper(List, 'list')
const AddKeeper = aliveKeeper(Add, 'add')

const ele = (
  <BrowserRouter>
    <AliveProvider>
      <ul>
        <li>
          <Link to="/">首页</Link>
        </li>
        <li>
          <Link to="/list">列表</Link>
        </li>
        <li>
          <Link to="/add">添加</Link>
        </li>
      </ul>

      <Switch>
        <Route path="/" component={HomeKeeper} exact />
        <Route path="/list" component={ListKeeper} />
        <Route path="/add" component={AddKeeper} />
      </Switch>
    </AliveProvider>
  </BrowserRouter>
)
ReactDOM.render(ele, document.getElementById('root'))
