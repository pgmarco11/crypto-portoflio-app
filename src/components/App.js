import {useState, useEffect, useId} from "react"
import Header from './Header/Header';
import Home from './Home';
import api from '../api/portfolios';
import Portfolios from './Portfolios';
import NewsFeed from './NewsFeed';
import {Routes, Route } from "react-router-dom"

function App() {

 

  return (
    
        <div className="app-dashboard">
          <Header />
          <div className="ui container app"> 
            <Routes>            
              <Route path="*" exact element={<Home />} />
              <Route path="/portfolios" element={<Portfolios />} />
            </Routes>
            <div className="app-news">
                <h2>News Feed</h2>
                 <NewsFeed /> 
            </div> 
          </div>
      </div>

  );
}

export default App;
;