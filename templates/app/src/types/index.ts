<% if (flags.addRedux) { %>
export type AppState = {
  application: {
    inited: boolean;
  };
};

export type ActionObject = {
  type?: string;
};
<% } %>
