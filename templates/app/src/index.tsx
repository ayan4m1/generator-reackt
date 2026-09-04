import { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createHashRouter } from 'react-router-dom';

<% if (flags.addRedux) { %>
import { Provider } from 'react-redux';
import createSagaMiddleware from 'redux-saga';
import { applyMiddleware, createStore, compose } from 'redux';
<% } %>

import './index.scss';
<% if (styleFramework === 'materialize') { %>
import 'materialize-css';
<% } %>
import Layout from './components/Layout';
import SuspenseFallback from './components/SuspenseFallback';
import ErrorBoundary from './components/ErrorBoundary';
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

if (rootElem) {
  const root = createRoot(rootElem);
  const router = createHashRouter([
    {
      path: '/',
      element: <Layout />,
      errorElement: <ErrorBoundary />,
      children: [
        {
          index: true,
          lazy: () => import(`./pages/index`)
        }
      ]
    }
  ]);

  root.render(
<% if (flags.addRedux) { %>
      <Provider store={store}>
<% } %>
        <Suspense fallback={<SuspenseFallback />}>
          <RouterProvider router={router} />
        </Suspense>
<% if (flags.addRedux) { %>
      </Provider>
<% } %>
  )
}