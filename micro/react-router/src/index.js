import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route } from './react-router-dom'
import User from './components/User'
import Home from './components/Home'
import Profile from './components/Profile'

ReactDOM.render(
  <Router>
    <Route path='/' exact={true} component={Home}></Route>
    <Route path='/user' exact={true} component={User}></Route>
    <Route path='/profile' exact={true} component={Profile}></Route>
  </Router>,
  document.getElementById('root')
);


