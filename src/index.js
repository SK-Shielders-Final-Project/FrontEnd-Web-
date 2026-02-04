import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from "./App"; // Import App
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';

const container = document.getElementById('root');

if (container.hasChildNodes()) {
  ReactDOM.hydrateRoot(
    container,
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
} else {
  const root = ReactDOM.createRoot(container);
  root.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

// const root = ReactDOM.createRoot(document.getElementById("root"));
// root.render(React.createElement(App));
// //const root = ReactDOM.createRoot(document.getElementById('root'));
// //root.render(
// //  <React.StrictMode>
// //    <App />
// //  </React.StrictMode>
// //);

// // If you want to start measuring performance in your app, pass a function
// // to log results (for example: reportWebVitals(console.log))
// // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
