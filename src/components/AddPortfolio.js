import React from "react"
import {useState, useEffect} from "react"
import { Link } from 'react-router-dom'
import { v4 as uuid } from 'uuid';
 

class AddPortfolio extends React.Component{  
    state = {
        id: "",
        name: "",
    }

    add = (e) => {
        e.preventDefault() 
        
        if(this.state.name === ""){
            alert("Please enter a portfolio name to add!")
            return;
        }
        this.props.addPortfolioHandler(this.state);
        this.setState({id: "", name: "" });
    }
    

render() {   
const {name} = this.state;
return (

    <div className="ui portfolio-add">
        
        <div className="portfolio-adding">
        <h2>Add Portfolio</h2>  
        <div className="ui main">

        <form className="ui form" onSubmit={this.add}>
            <div className="field">
            <label>Portfolio Name: </label>
            <input
                type="text"
                name="portfolio-name"
                placeholder="My Portfolio"
                value={name}
                onChange={
                    (e) => this.setState({
                    id: uuid(), 
                    name: e.target.value
                    })}
            />
            <button     
            type="submit" 
            className="btn-portfolio ui button blue btn-addportfolio right">
            Add</button>
            </div>       
        </form>
        <Link to="/">
        <button className="btn-portfolio ui button grey">
        Cancel</button>
        </Link>  
        </div>               

        </div>

    </div> 

)}

}
export default AddPortfolio;