import React from "react"
import { Link, useLocation } from "react-router-dom"
import coin from "../images/bitcoin.png";

const Portfolio = (props) => {

    const location = useLocation();
    const state = location.state;
    console.log(state);

    console.log(state.name)

    return (
    <div className="portfolio-coins centered main">
        <h2>{state.name}</h2>
            <div className="ui coin-table">
                <div className="coin-table-header">
                    <div className="headerCell" align="center">Coin</div>
                    <div className="headerCell" align="center">Price</div>
                </div>
                <div className="coin-table-row">
                    <div className="rowCell image"><img src={coin} alt="coin" /></div>
                    <div className="rowCell description">Bitcon</div>
                </div>
            </div>            
        </div>
    );

};
export default Portfolio;