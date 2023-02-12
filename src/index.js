import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Header from './components/Header/Header';
import App from './components/App';
import {BrowserRouter as Router } from "react-router-dom"

ReactDOM.render(
  <Router>
    <div className="app-dashboard">
      <Header />
      <App />
    </div>
  </Router>,
  document.getElementById('root')
);