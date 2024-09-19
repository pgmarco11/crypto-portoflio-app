import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from "react-router-dom"
import api from '../api/portfolios';

const EditPortoflio = (props) => { 

    console.log("Click EDIT ID props 0:"+props.portfolio.id);
    
    const name = props.portfolio.name;
    const id = props.portfolio.id;

    const data = {
        id: id,
        name: name
    }

    console.log("Click EDIT ID 1:"+id)

    const history = useNavigate();

    const [portfolioName, setPortfolioName] = useState(name);

    const update = async (e) => {
       
        e.preventDefault();
  
        if (portfolioName === "") {
            alert("Please enter a portfolio name");
            return;
        }

        const updatedPortfolio = { ...props.portfolio, name: portfolioName };

        await api.put(`http://localhost:8888/portfolios/${id}`, updatedPortfolio);

        props.editPortfolioHandler(updatedPortfolio);

        return history("/");
    }


    return ( 
 
        <div className="ui main">
    
        <form className="ui form" onSubmit={update}>
            <div className="field">
            <label>Portfolio Name: </label>
            <input 
            name="name" 
            value={portfolioName}
            onChange={(e) => setPortfolioName(e.target.value)} 
            />          
            <button     
            type="submit" 
            className="btn-portfolio ui button blue btn-addportfolio right">
            Update</button>
            </div>       
        </form>

        </div>  
  
    );

};
export default EditPortoflio;