import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import Login from './components/Login';
import Battery from './components/Battery';
import Wrong from './components/Error';

import './global.css'

export default function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path='/' exact component={Login} />
        <Route path='/index' exact component={Login} />
        <Route path='/login' exact component={Login} />
        <Route path='/battery' exact component={Battery} />
        <Route path='/wrong' component={Wrong} />
        <Route component={Wrong} />
      </Switch>
    </BrowserRouter>
  );
}
