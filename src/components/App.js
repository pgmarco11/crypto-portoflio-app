import {useState, useEffect, useId} from "react"
import Home from './Home';
import api from '../api/portfolios';
import Portfolios from './Portfolios';
import Portfolio from './Portfolio'
import PortfolioCoins from './PortfolioCoins';
import Analysis from './Analysis';
import {Routes, Route } from "react-router-dom"

function App() {

 

  return (   

          <div className="ui container app"> 
            <Routes>            
              <Route path="*" exact element={<Home />} />
              <Route path="/portfolios/*" element={<Portfolios />} />
              <Route path="/analysis/*" element={<Analysis />} />
              <Route path="/portfolio/:id" element={<Portfolio />} />
              <Route path="/portfolios/:id/coins" component ={PortfolioCoins} />
            </Routes>
          </div>
  );
}

export default App;
;