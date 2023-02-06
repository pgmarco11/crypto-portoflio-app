import React, { useState } from "react"
import { Link } from 'react-router-dom'
import api from '../api/portfolios';
import PortfolioEntry from "./PortfolioEntry"

const PortfolioPage = (props) => {    

        const [portfolios, setPortfolios] = useState(props.portfolios); 

        const idPortfolioHandler = async (id) => {

            const response = await api.delete(`http://localhost:3006/portfolios/${id}`);

            if (response.status === 200) {
                const newPortfolioList = portfolios.filter((portfolio) => {
                return portfolio.id !== id;
                });                

                props.getPortfolioId(id)
            }  

        }   
 

    return (
        <div className="ui relaxed divided list">
            {props.portfolios.map((portfolio) => (
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
            Add Portfolio</button>
            </Link>   
        </div>
    );
};

export default PortfolioPage;