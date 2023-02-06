import React, { useState } from 'react';
import "./../font-awesome/css/font-awesome.min.css"
import "./Header.css";
import { MenuList } from "./MenuList";
import { NavLink } from "react-router-dom";


//functional component
const Header = () => {
    const [clicked, setClicked] = useState(false);
    const menuList = MenuList.map(({ url,title}, index) => {

        return(
                <li key={index}><NavLink to={url}>{title}</NavLink></li>
        );
    });

    const handleClick = () =>{
        setClicked(!clicked);
    }
    return (

        <div className="app-header">
            <nav className="Nav">
                <div className="logo">
                    Digital<font> Crypto Zone</font>
                </div> 
                <div className="menu-icon" onClick={handleClick}>
                <i className={ clicked ? "fa fa-times" : "fa fa-bars" } ></i>
                </div>
                <ul className={ clicked ? "menu-list" : "menu-list close" } >
                        {menuList}
                </ul>      
            </nav>
        </div>

    );

};

export default Header;