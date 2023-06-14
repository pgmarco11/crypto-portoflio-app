import React, { useState, useEffect } from "react"
import { Link } from 'react-router-dom'
import api from '../api/portfolios';
import PortfolioEntry from "./PortfolioEntry"

const PortfolioPage = (props) => {    

    const [portfolios, setPortfolios] = useState([]);

    useEffect(() => {
        setPortfolios(props.portfolios); // Update the portfolios state when the prop changes
      }, [props.portfolios]);

    const idPortfolioHandler = async (id) => {
        const response = await api.delete(`http://localhost:3006/portfolios/${id}`);

        if (response.status === 200) {
            const newPortfolioList = portfolios.filter((portfolio) => {
                return portfolio.id !== id;
            });                

            setPortfolios(newPortfolioList);
        }  
    }   

    return (
        <div className="ui relaxed divided list">
            {portfolios.map((portfolio) => (
                <div className="item" key={portfolio.id}>
                    <div className="ui celled list portfolio-list">                         
                        <PortfolioEntry 
                            portfolio={portfolio}                     
                            clickHandler={idPortfolioHandler}
                            key={portfolio.id}
                        />
                    </div>
                </div>
            ))}
            <Link to="/add">
                <button className="btn-portfolio ui button blue right">
                    Add Portfolio
                </button>
            </Link>   
        </div>
    );
};

export default PortfolioPage;
