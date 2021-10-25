import React from 'react';
import { Switch, Route } from 'react-router-dom';

import LoginPage from './LoginPage';
import LandingPage from './LandingPage';

const Main = () => {
  return (
    <Switch>
        <Route exact path='/' component={LoginPage}></Route>
        <Route path='/landing' component={LandingPage}></Route>
    </Switch>
  );
}

export default Main;
