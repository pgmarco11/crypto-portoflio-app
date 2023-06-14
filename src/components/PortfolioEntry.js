import React from "react";
import { Link } from "react-router-dom";

const PortfolioEntry = (props) => {
  const name = props.portfolio.name;
  const id = props.portfolio.id;

  return (
    <div className="item">
      <div className="content">
        <Link
          to={{
            pathname: "/portfolio",
            search: `?id=${id}&name=${name}`,
          }}
          className="portfolio-link"
        >
          <div className="header">{name}</div>
        </Link>
      </div>
      <i
        className="trash alternate outline icon"
        style={{ color: "red", marginBottom: "7px", marginLeft: "10px" }}
        onClick={(portfolio) => props.clickHandler(id)}
      ></i>
      <Link to={{ pathname: `/edit/${id}` }} >
        <i
          className="edit alternate outline icon"
          style={{ color: "blue", marginBottom: "7px" }}
        ></i>
      </Link>
    </div>
  );
};

export default PortfolioEntry;