import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { LiaSpinnerSolid } from "react-icons/lia";
import { MdTune } from "react-icons/md";
import { VIBECART_URI } from '../../commoncomponents/service';
import Breadcrumbs from "../Homepage/Breadcrumbs";
import axios from "axios";
import "../Homepage/ProductPage.css";

// Import Redux actions (ensure these are correctly defined in your Redux slice)
import {
  setFilterCategories,
  setFilterColors,
  setFilterPriceRanges,
  setSortOption,
  toggleFilterVisibility,
} from "../../redux-toolkit/productPageSlice";

const defaultImage = "https://via.placeholder.com/150";

const ProductPage = () => {
  // Local state for products, offers, loading, and error
  const [products, setProducts] = useState([]);
  const [offers, setOffers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Redux dispatch and state selectors
  const dispatch = useDispatch();
  const {
    filterCategories,
    filterColors,
    filterPriceRanges,
    sortOption,
    showFilters,
  } = useSelector((state) => state.productPage);

  // React Router's location to parse query parameters
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchTerm = searchParams.get("searchquery")?.toLowerCase() || "";
  const category = searchParams.get("category");

  // Breadcrumbs for navigation
  const breadcrumbs = [
    { label: "Home", path: "/" },
    { label: "Products", path: "/products" },
  ];

  /**
   * Fetch products based on searchTerm or category.
   * This effect runs whenever 'searchTerm' or 'category' changes.
   */
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      let apiUrl = "";
      if (searchTerm) {
        apiUrl = `${VIBECART_URI}/api/v1/vibe-cart/app/items?searchquery=${searchTerm}`;
      } else if (category) {
        apiUrl = `${VIBECART_URI}/api/v1/vibe-cart/app/items/category/${category}`;
      } else {
        apiUrl = `${VIBECART_URI}/api/v1/vibe-cart/app/items`;
      }

      try {
        const response = await axios.get(apiUrl);
        if (response.data && Array.isArray(response.data)) {
          setProducts(response.data);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, searchTerm]);

  /**
   * Fetch offers for each product.
   * This effect runs whenever 'products' changes.
   * Optimized to fetch all offers in parallel and update the 'offers' state once.
   */
  useEffect(() => {
    const fetchAllOffers = async () => {
      const newOffers = {};

      try {
        // Create an array of promises for fetching offers
        const offerPromises = products.map((product) =>
          axios
            .get(
              `${VIBECART_URI}/api/v1/vibe-cart/offers/item/${product.itemID}`
            )
            .then((response) => {
              newOffers[product.itemID] = response.data;
            })
            .catch((error) => {
              console.error(
                `Error fetching offers for item ${product.itemID}:`,
                error
              );
              // Optionally handle individual offer fetch errors
              newOffers[product.itemID] = null; // Or any default value
            })
        );

        // Wait for all offer fetches to complete
        await Promise.all(offerPromises);

        // Update the 'offers' state once with all fetched offers
        setOffers(newOffers);
      } catch (error) {
        console.error("Error fetching offers:", error);
        // Optionally handle overall offer fetching errors
      }
    };

    if (products.length > 0) {
      fetchAllOffers();
    } else {
      setOffers({});
    }
  }, [products]);

  /**
   * Function to calculate the discounted price based on the discount type.
   * @param {number} price - Original price of the product.
   * @param {number} discount - Discount value.
   * @param {string} discountType - Type of discount ('PERCENTAGE' or 'PRICE').
   * @returns {number} - Discounted price.
   */
  const calculateDiscountedPrice = (price, discount, discountType) => {
    if (discountType === "PERCENTAGE") {
      return price - (price * discount) / 100;
    } else if (discountType === "PRICE") {
      return price - discount;
    }
    return price;
  };

  /**
   * Handlers for filter changes.
   * These handlers toggle the inclusion of a filter value in the respective Redux state arrays.
   */

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    const updatedCategories = filterCategories.includes(value)
      ? filterCategories.filter((category) => category !== value)
      : [...filterCategories, value];
    dispatch(setFilterCategories(updatedCategories));
  };

  const handleColorChange = (e) => {
    const value = e.target.value;
    const updatedColors = filterColors.includes(value)
      ? filterColors.filter((color) => color !== value)
      : [...filterColors, value];
    dispatch(setFilterColors(updatedColors));
  };

  const handlePriceRangeChange = (e) => {
    const value = e.target.value;
    const updatedPriceRanges = filterPriceRanges.includes(value)
      ? filterPriceRanges.filter((priceRange) => priceRange !== value)
      : [...filterPriceRanges, value];
    dispatch(setFilterPriceRanges(updatedPriceRanges));
  };

  /**
   * Apply filters and sorting to the fetched products.
   * This creates a new array 'filteredProducts' based on the current filter and sort criteria.
   */
  const filteredProducts = products
    .filter(
      (product) => {
        return product.itemName.toLowerCase().includes(searchTerm) ||
          product.itemDescription.toLowerCase().includes(searchTerm)
      }
    )
    .filter((product) =>
      filterCategories.length
        ? filterCategories.includes(product.categoryID.toString())
        : true
    )
    .filter((product) =>
      filterColors.length
        ? product.availableColors.some(color => filterColors.includes(color.toLowerCase()))
        : true
    )

    .filter((product) => {
      if (!filterPriceRanges.length) return true;
      return filterPriceRanges.some((range) => {
        if (range === "500-above") {
          return product.price >= 500;
        }
        const [min, max] = range.split("-").map(Number);
        return product.price >= min && (max ? product.price <= max : true);
      });
    })
    .sort((a, b) => {
      if (sortOption === "priceLowToHigh") {
        return a.price - b.price;
      } else if (sortOption === "priceHighToLow") {
        return b.price - a.price;
      } else if (sortOption === "nameAtoZ") {
        return a.itemName.localeCompare(b.itemName);
      } else if (sortOption === "nameZtoA") {
        return b.itemName.localeCompare(a.itemName);
      }
      return 0;
    });

  return (
    <div className="product-page">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs breadcrumbs={breadcrumbs} />

      {/* Hero Section */}
      <div className="hero-section">
        <h3 className="text-center my-4">Explore Our Products</h3>
      </div>

      {/* Search Results Information */}
      <div className="container">
        {searchTerm && (
          <p className="search-results-info">
            {products.length} search result{products.length !== 1 ? "s" : ""}{" "}
            for <span className="search-word">"{searchTerm}"</span>
          </p>
        )}
      </div>

      {/* Filter and Sort Controls */}
      <div className="container">
        <div className="filter-container">
          <div className="filters">
            <button
              className="btn filter-button"
              onClick={() => dispatch(toggleFilterVisibility())}
            >
              {showFilters ? "Hide Filters " : "Filters "}
              <MdTune />
            </button>

            {/* Sort Section */}
          </div>
          <div className="sort-section">
            <label htmlFor="sortOption" className="form-label">
              Sort by:
            </label>
            <select
              id="sortOption"
              className="form-select"
              value={sortOption}
              onChange={(e) => dispatch(setSortOption(e.target.value))}
            >
              <option value="">Default</option>
              <option value="priceLowToHigh">Price: Low to High</option>
              <option value="priceHighToLow">Price: High to Low</option>
              <option value="nameAtoZ">Name: A to Z</option>
              <option value="nameZtoA">Name: Z to A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content: Filters and Products */}
      <div className="container">
        <div className="row">
          {/* Filter Section (Sidebar) */}
          {showFilters && (
            <div className="col-md-2 mb-4 filter-aside">
              <div className="filter-section">
                {/* Categories Filter */}
                <div className="mb-3">
                  {category === "jackets" && <> <h5>Categories</h5>
                    <h6>Jackets:</h6>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        value="101" // Winter Jackets
                        onChange={handleCategoryChange}
                        checked={filterCategories.includes("101")}
                        id="category-101"
                      />
                      <label className="form-check-label" htmlFor="category-101">
                        Winter Jackets
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        value="102" // Leather Jackets
                        onChange={handleCategoryChange}
                        checked={filterCategories.includes("102")}
                        id="category-102"
                      />
                      <label className="form-check-label" htmlFor="category-102">
                        Leather Jackets
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        value="103" // Casual Jackets
                        onChange={handleCategoryChange}
                        checked={filterCategories.includes("103")}
                        id="category-103"
                      />
                      <label className="form-check-label" htmlFor="category-103">
                        Casual Jackets
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        value="104" // Outdoor & Sports Jackets
                        onChange={handleCategoryChange}
                        checked={filterCategories.includes("104")}
                        id="category-104"
                      />
                      <label className="form-check-label" htmlFor="category-104">
                        Outdoor & Sports Jackets
                      </label>
                    </div>
                  </>}{category === "shoes" && <>
                    <h6>Shoes:</h6>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        value="105" // Sports Shoes
                        onChange={handleCategoryChange}
                        checked={filterCategories.includes("105")}
                        id="category-105"
                      />
                      <label className="form-check-label" htmlFor="category-105">
                        Sports
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        value="106" // Casual Shoes
                        onChange={handleCategoryChange}
                        checked={filterCategories.includes("106")}
                        id="category-106"
                      />
                      <label className="form-check-label" htmlFor="category-106">
                        Casual
                      </label>
                    </div>
                  </>}
                </div>

                {/* Colors Filter */}
                <div className="mb-3">
                  <h5>Colors</h5>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      value="black"
                      onChange={handleColorChange}
                      checked={filterColors.includes("black")}
                      id="color-black"
                    />
                    <label className="form-check-label" htmlFor="color-black">
                      Black
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      value="white"
                      onChange={handleColorChange}
                      checked={filterColors.includes("white")}
                      id="color-white"
                    />
                    <label className="form-check-label" htmlFor="color-white">
                      White
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      value="green"
                      onChange={handleColorChange}
                      checked={filterColors.includes("green")}
                      id="color-green"
                    />
                    <label className="form-check-label" htmlFor="color-green">
                      Green
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      value="yellow"
                      onChange={handleColorChange}
                      checked={filterColors.includes("yellow")}
                      id="color-yellow"
                    />
                    <label className="form-check-label" htmlFor="color-yellow">
                      Yellow
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      value="blue"
                      onChange={handleColorChange}
                      checked={filterColors.includes("blue")}
                      id="color-blue"
                    />
                    <label className="form-check-label" htmlFor="color-blue">
                      Blue
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      value="red"
                      onChange={handleColorChange}
                      checked={filterColors.includes("red")}
                      id="color-red"
                    />
                    <label className="form-check-label" htmlFor="color-red">
                      Red
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      value="brown"
                      onChange={handleColorChange}
                      checked={filterColors.includes("brown")}
                      id="color-brown"
                    />
                    <label className="form-check-label" htmlFor="color-brown">
                      Brown
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      value="pink"
                      onChange={handleColorChange}
                      checked={filterColors.includes("pink")}
                      id="color-pink"
                    />
                    <label className="form-check-label" htmlFor="color-pink">
                      Pink
                    </label>
                  </div>

                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      value="purple"
                      onChange={handleColorChange}
                      checked={filterColors.includes("purple")}
                      id="color-purple"
                    />
                    <label className="form-check-label" htmlFor="color-purple">
                      Purple
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      value="grey"
                      onChange={handleColorChange}
                      checked={filterColors.includes("grey")}
                      id="color-grey"
                    />
                    <label className="form-check-label" htmlFor="color-grey">
                      Grey
                    </label>
                  </div>
                </div>

                <div className="mb-3">
                  <h5>Price Range</h5>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      value="0-200"
                      onChange={handlePriceRangeChange}
                      checked={filterPriceRanges.includes("0-200")}
                      id="price-0-200"
                    />
                    <label className="form-check-label" htmlFor="price-0-200">
                      $0 - $200
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      value="200-500"
                      onChange={handlePriceRangeChange}
                      checked={filterPriceRanges.includes("200-500")}
                      id="price-200-500"
                    />
                    <label className="form-check-label" htmlFor="price-200-500">
                      $200 - $500
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      value="500-above"
                      onChange={handlePriceRangeChange}
                      checked={filterPriceRanges.includes("500-above")}
                      id="price-500-above"
                    />
                    <label
                      className="form-check-label"
                      htmlFor="price-500-above"
                    >
                      $500 and above
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className={showFilters ? "col-md-10" : "col-12"}>
            <div className="product_filter">
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-5 g-1">
                {loading ? (
                  <div className="col-12 text-center">
                    <LiaSpinnerSolid size={50} className="spinner" />
                  </div>
                ) : error ? (
                  <div className="col-12">
                    <p className="text-center text-danger">{error}</p>
                  </div>
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => {
                    const bestOffer = offers[product.itemID]?.[0];
                    const originalPrice = product.price;
                    const offerPrice = bestOffer
                      ? calculateDiscountedPrice(
                        originalPrice,
                        bestOffer.offerDiscountValue,
                        bestOffer.offerDiscountType
                      )
                      : originalPrice;
                    return (
                      <div
                        className="col mb-2"
                        key={`${product.skuId}`}
                      >
                        <div className="card product-card">
                          <div>
                            <img
                              src={
                                product.imageURLs[0]
                                  ? product.imageURLs[0]
                                  : defaultImage
                              }
                              className="card-img-top"
                              alt={product.itemName || "Product"}
                            />
                          </div>
                          <div className="card-body bh">
                            <h5 className="card-title">{product.itemName}</h5>
                            <div className="price-section">
                              {bestOffer ? (
                                <>
                                  <div className="productdiscount">
                                    <p className="offer-price">
                                      ${offerPrice.toFixed(2)}
                                    </p>
                                    <p className="original-price">
                                      ${originalPrice.toFixed(2)}
                                    </p>
                                  </div>

                                  <p className="discount-details">
                                    {bestOffer.offerDiscountValue}
                                    {bestOffer.offerDiscountType ===
                                      "PERCENTAGE"
                                      ? "%"
                                      : "$"}{" "}
                                    off
                                  </p>
                                </>
                              ) : (
                                <p className="card-text">
                                  ${originalPrice.toFixed(2)}
                                </p>
                              )}
                            </div>
                            <Link
                              to={`/product/${product.itemID}`}
                              className="viewDetails"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-6">
                    <p className="text-center">No products found.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
