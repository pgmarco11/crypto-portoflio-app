import React from "react"
import { Link, useLocation } from "react-router-dom"
import PortfolioCoins from './PortfolioCoins';
const Portfolio = (props) => {

    const location = useLocation();
    const state = location.state;  

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
      
      let nameString = state.name;
      let capitalizednameString  = capitalizeFirstLetter(nameString);


    return (
    <div className="portfolio-coins centered main">
        <h2>{capitalizednameString} Portfolio</h2>
            <div className="ui coin-table">
                <PortfolioCoins portfolioName={state.name} portfolioId={state.id} portfolioState={state} />
            </div>
    </div>
    );

};
export default Portfolio;