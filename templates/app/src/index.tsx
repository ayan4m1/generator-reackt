import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
<% if (flags.addRedux) { %>
import { Provider } from 'react-redux';
import createSagaMiddleware from 'redux-saga';
import { applyMiddleware, createStore, compose } from 'redux';
<% } %>

import './index.scss';
import { App } from './components/App';
<% if (flags.addRedux) { %>
import rootSaga from './sagas';
import rootReducer from './reducers';

const composer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const sagaMiddleware = createSagaMiddleware();
const enhancers = composer(applyMiddleware(sagaMiddleware));

export const store = createStore(rootReducer, {}, enhancers);

sagaMiddleware.run(rootSaga);
<% } %>

const rootElem = document.getElementById('root');

if (!rootElem) {
  return;
}

const root = createRoot(rootElem);

root.render(
  <Router>
<% if (flags.addRedux) { %>
    <Provider store={store}>
      <App />
    </Provider>
<% } else { %>
    <App />
<% } %>
  </Router>
)
