import "react-app-polyfill/ie11";
import "react-app-polyfill/stable";
import * as serviceWorker from "../serviceWorker";
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
// import { createStore } from "redux";
import { configureStore } from "@reduxjs/toolkit"; //UPDATED

import ProviderRequestNew from "./Components/Main";
import Reducer from "./Store/Reducer";

export const Init = () => {
  // const store = createStore(Reducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());
  const store = configureStore({
    reducer: { Reducer },
    devTools:
      window.__REDUX_DEVTOOLS_EXTENSION__ &&
      window.__REDUX_DEVTOOLS_EXTENSION__(),
  });

  ReactDOM.render(
    <React.StrictMode>
      <Provider store={store}>
        Hello
        <ProviderRequestNew />
      </Provider>
    </React.StrictMode>,
    document.getElementById("root")
  );
};
if (window.ConceptName == "ProviderRequest") Init();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
