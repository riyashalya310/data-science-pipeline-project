import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux';
import store from './store';
import DndProviderWrapper from '../src/components/DndProvider'
import { GoogleOAuthProvider } from '@react-oauth/google';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <DndProviderWrapper>
    <GoogleOAuthProvider clientId="126973402830-785076tqj7sq62ahujsmdv2egm0fojtd.apps.googleusercontent.com">
    <App />
    </GoogleOAuthProvider>
    </DndProviderWrapper>
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
