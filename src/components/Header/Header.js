import React, { useState, useEffect } from 'react';
import './../font-awesome/css/font-awesome.min.css';
import './Header.css';
import axios from 'axios';
import api from '../../api/portfolios';
import { MenuList } from './MenuList';
import { Link, NavLink } from 'react-router-dom';

// Functional component
const Header = () => {
  const [clicked, setClicked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [portfolioData, setPortfolioData] = useState([]);
  const [showPortfolioList, setShowPortfolioList] = useState(false);

  useEffect(() => {
    api.get('http://localhost:8888/portfolios/')
      .then((response) => setPortfolioData(response.data))
      .catch((error) => console.error('Error fetching portfolio data:', error));
  }, []);

  const handleClick = () => {
    if (menuList.some(({ title }) => title === 'Portfolios')) {
      setShowPortfolioList(!showPortfolioList);
    } else {
      setClicked(!clicked);
    }
  };

  const handleMouseEnter = () => {
    if (menuList.some(({ title }) => title === 'Portfolios')) {
      setShowPortfolioList(true);
    }
  };

  const handleMouseLeave = () => {
    setShowPortfolioList(false);
  };

  const menuList = MenuList.map(({ url, title }, index) => {
    if (title === 'Portfolios') {
      return (
        <li key={index}>
          <a
            href="/portfolios"
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="portfolio-link"
          >
            {title}
          </a>
          <ul className="portfolio-list">
            {portfolioData.map((portfolio) => (
              <li key={portfolio.id}>
                <Link
                  to={{
                    pathname: '/portfolio',
                    search: `?id=${portfolio.id}&name=${encodeURIComponent(
                      portfolio.name
                    )}`,
                  }}
                  className="portfolio-link"
                >
                  {portfolio.name}
                </Link>
              </li>
            ))}
          </ul>
        </li>
      );
    } else {
      return (
        <li key={index}>
          <NavLink to={url}>{title}</NavLink>
        </li>
      );
    }
  });
  

  return (
    <div className="app-header">
      <nav className="Nav">
        <div className="logo">
          Digital<font> Crypto Zone</font>
        </div>
        <div className="menu-icon" onClick={handleClick}>
          <i className={clicked ? 'fa fa-times' : 'fa fa-bars'}></i>
        </div>
        <ul className={clicked ? 'menu-list open' : 'menu-list'}>{menuList}</ul>
      </nav>
    </div>
  );
};

export default Header;