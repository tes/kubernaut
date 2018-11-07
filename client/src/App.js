// Framework
import React, { Component } from 'react';
import { createBrowserHistory } from 'history';
import { connectRouter, routerMiddleware, ConnectedRouter } from 'connected-react-router';
import { createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import formActionSaga from 'redux-form-saga';
import { Provider } from 'react-redux';
import 'bootstrap';

import Header from './components/Header';
import Routes from './routes';

// Reducers
import rootReducer from './modules';

import sagas from './sagas';

import { fetchAccountInfo } from './modules/account';

// Styles
import 'font-awesome/css/font-awesome.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'; // Must be imported after bootstrap css

/***************************************************************
Using require and assigning jQuery to window to workaround the
following errors on npm start and npm test:

  1) 'Bootstrap's JavaScript requires jQuery' error
  2) Uncaught ReferenceError: define is not defined

***************************************************************/
window.jQuery = window.$ = require('jquery');
// require('bootstrap/dist/js/bootstrap.min.js');

const history = createBrowserHistory();
const initialState = {};

const sagaMiddleware = createSagaMiddleware();

const store = createStore(
  connectRouter(history)(rootReducer),
  initialState,
  (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : compose)(
    applyMiddleware(routerMiddleware(history), sagaMiddleware)
  )
);
sagaMiddleware.run(sagas);
sagaMiddleware.run(formActionSaga);

store.dispatch(fetchAccountInfo());

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <div>
            <Header />
            <div className='container mt-1'>
              <Routes dispatch={store.dispatch} />
            </div>
          </div>
        </ConnectedRouter>
      </Provider>
    );
  }
}

export default App;
