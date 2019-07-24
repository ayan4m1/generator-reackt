import '@babel/polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
<% if (flags.addRedux) { %>
import { Provider } from 'react-redux';
import createSagaMiddleware from 'redux-saga';
import { applyMiddleware, createStore, compose } from 'redux';
<% } %>
<% if (flags.addFontAwesome) { %>
// todo: uncomment the lines below, substituting in the icons you need
// import { library } from '@fortawesome/fontawesome-svg-core';
// import { faFontAwesome } from '@fortawesome/free-solid-svg-icons';
// library.add(faFontAwesome);
<% } %>

import './index.scss';
import App from './components/App/App';
<% if (flags.addRedux) { %>
import rootSaga from './sagas';
import rootReducer from './reducers';

/* eslint-disable no-underscore-dangle */
const composer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
/* eslint-enable */

const sagaMiddleware = createSagaMiddleware();
const enhancers = composer(applyMiddleware(sagaMiddleware));

export const store = createStore(rootReducer, {}, enhancers);

if (module.hot) {
  module.hot.accept('./reducers', () => {
    store.replaceReducer(require('./reducers').default);
  });
}

sagaMiddleware.run(rootSaga);
<% } %>

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);

export default App;

