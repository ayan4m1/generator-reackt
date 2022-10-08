import 'core-js/stable';
import 'regenerator-runtime/runtime';

import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
<% if (flags.addRedux) { %>
import { Provider } from 'react-redux';
import createSagaMiddleware from 'redux-saga';
import { applyMiddleware, createStore, compose } from 'redux';
<% } %>

<% if (flags.addFontAwesome) { %>
  import './icons.js';
<% } %>
import './index.scss';
import App from './components/App';
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
  <Router>
<% if (flags.addRedux) { %>
    <Provider store={store}>
      <App />
    </Provider>
<% } else { %>
    <App />
<% } %>
  </Router>,
  document.getElementById('root')
);
