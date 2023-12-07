import RestaurantCard, { isRestaurantOpened } from "./RestaurantCard";
import { useState, useEffect } from "react";
import Shimmer from "./Shimmer";
import { Link } from "react-router-dom";
import NoResult from "./NoResult";
import useOnlineStatus from "../utils/useOnlineStatus";

const getTopRated = (listofRestaurants) => {
  // console.log("getTopRated triggered");
  return listofRestaurants.filter(
    (restaurant) => restaurant.info.avgRating > 4.0
  );
};

const Body = () => {
  const topRated = "TOP RATED RESTAURANTS";
  const seeAllRes = "SEE ALL RESTAURANTS";

  const [searchInput, setSearchInput] = useState(""); //state variable
  const [listofRestaurants, setListofRestaurants] = useState([]);
  const [btnName, setBtnName] = useState(topRated);
  //when setListofRestaurants will be called, it will find the diff and do reconcillation
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [resultsFound, setResultsFound] = useState(true);
  const onlineStatus = useOnlineStatus();

  const RestaurantCardOpened = isRestaurantOpened(RestaurantCard);

  console.log("listofRes : ", listofRestaurants);

  const searchResorDish = () => {
    const filteredRes = listofRestaurants.filter((restaurant) =>
      restaurant.info.name.toLowerCase().includes(searchInput.toLowerCase())
    );
    return filteredRes.length == 0
      ? setResultsFound(false)
      : setFilteredRestaurants(filteredRes);
  };

  const fetchData = async () => {
    setListofRestaurants([]);
    const myData = await fetch(
      "https://corsproxy.io/?https://www.swiggy.com/dapi/restaurants/list/v5?lat=28.6315885&lng=77.28307649999999&is-seo-homepage-enabled=true&page_type=DESKTOP_WEB_LISTING"
    );
    const jsonData = await myData.json();
    setListofRestaurants(
      jsonData?.data?.cards[2]?.card?.card?.gridElements?.infoWithStyle
        ?.restaurants
    );
    setFilteredRestaurants(
      jsonData?.data?.cards[2]?.card?.card?.gridElements?.infoWithStyle
        ?.restaurants
    );
  };

  useEffect(() => {
    console.log("useffect triggered");
    if (searchInput === "") {
      setResultsFound(true);
      fetchData();
    }
  }, [searchInput]);

  if (!onlineStatus) {
    return <h1 style={{ textAlign: "center" }}>Looks like you're offline!</h1>;
  }

  return (listofRestaurants && listofRestaurants?.length) === 0 ? (
    <Shimmer />
  ) : (
    <>
      <div className="flex items-center justify-around">
        <div className="m-4 p-4">
          <input
            placeholder="search your favorite restaurant..."
            className="border border-solid border-black w-60"
            type="text"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key == "Enter") {
                searchResorDish();
              }
            }}
          />
          <button
            className="px-4 py-1 m-2 bg-cyan-200 rounded-xl"
            onClick={() => {
              searchResorDish();
            }}
          >
            Search
          </button>
        </div>
        <div>
          <button
            className="px-4 py-2 m-2 bg-cyan-100 rounded-lg"
            onClick={() => {
              if (btnName === seeAllRes) {
                fetchData();
                setBtnName(topRated);
              } else {
                const newResData = getTopRated(listofRestaurants);
                setFilteredRestaurants(newResData);
                setBtnName(seeAllRes);
              }
            }}
          >
            {btnName}
          </button>
        </div>
      </div>
      {resultsFound === false ? (
        <NoResult />
      ) : (
        <div className="flex flex-wrap items-stretch">
          {filteredRestaurants?.length > 0 &&
            filteredRestaurants.map((restaurant) => {
              return (
                <Link
                  className="my-4"
                  key={restaurant.info.id}
                  to={"/restaurants/" + restaurant.info.id}
                >
                  {restaurant.info.isOpen ? (
                    <RestaurantCardOpened {...restaurant.info} />
                  ) : (
                    <RestaurantCard {...restaurant.info} />
                  )}
                </Link>
              );
            })}
        </div>
      )}
    </>
  );
};

export default Body;
