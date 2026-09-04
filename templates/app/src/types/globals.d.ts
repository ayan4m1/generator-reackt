declare module '*.scss';
<% if (flags.addRedux) { %>
// installed by the Redux DevTools browser extension, so it may not be there
interface Window {
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof import('redux').compose;
}
<% } %>
