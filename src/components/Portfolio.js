import React, { useEffect, lazy, Suspense } from "react";
import { Link, useParams, useLocation } from "react-router-dom";


const PortfolioCoins = lazy(() => import("./PortfolioCoins"));

const Portfolio = () => {

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get("id");
  const name = queryParams.get("name");


  if (!id || !name) {
    return <div>Loading...</div>; // or any other loading state
  }

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  let capitalizednameString = capitalizeFirstLetter(name);

  return (
    <div className="portfolio-coins centered main">
      <h2>{capitalizednameString} Portfolio</h2>



      <Suspense fallback={<div>Loading...</div>}>
        <PortfolioCoins portfolioName={name} portfolioId={id} />
      </Suspense>
    </div>
  );
};

export default Portfolio;