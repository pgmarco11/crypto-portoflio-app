import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Home from './components/Home';
import Portfolios from './components/Portfolios';
import Portfolio from './components/Portfolio';
import Analysis from './components/Analysis';


ReactDOM.render(
  <Router>
    <>
      <Header />
      <div className="ui container app">
        <Routes>
          <Route path="*" element={<Home />} />
          <Route path="/portfolios/*" element={<Portfolios />} />
          <Route path="/analysis/*" element={<Analysis />} />
          <Route path="/portfolio/*" element={<Portfolio />} />
        </Routes>
      </div>
    </>
  </Router>,
  document.getElementById('root')
);
