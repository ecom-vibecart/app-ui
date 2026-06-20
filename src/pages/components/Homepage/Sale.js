import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { LiaSpinnerSolid } from 'react-icons/lia';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { CustomLeftArrow, CustomRightArrow } from '../Homepage/CustomArrows'
// import defaultImage from '../../assets/default.jpg';  // Assuming a default image

// import '../Homepage/Sale.css'; 
import { VIBECART_URI } from '../../commoncomponents/service';

const Sale = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 3000 },
      items: 5
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 5,
      slidesToSlide: 5
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1
    }
  };

  useEffect(() => {
    const query = new URLSearchParams(location.search).get('query');
    if (query) {
      setLoading(true);
      axios.get(`${VIBECART_URI}/api/v1/vibe-cart/app/items/catalog/${query}`)
        .then((response) => {
          setProducts(response.data);
        })
        .catch((error) => {
          console.error('Error fetching sale products:', error);
        })
        .finally(() => setLoading(false));
    }
  }, [location.search]);

  return (
    <section className="sale-products my-4">
      <div className="container">
        <h3>Sale Products</h3>
        {loading ? (
          <div className="text-center py-5">
            <LiaSpinnerSolid size={50} className="spinner" />
          </div>
        ) : products.length > 0 ? (
          <Carousel
            responsive={responsive}
            containerClass="carousel-container"
            customLeftArrow={<CustomLeftArrow />}
            customRightArrow={<CustomRightArrow />}
          >
            {products.map((product) => (
              <div className="col-12 mb-4" key={product.itemID}>
                <Link to={`/product/${product.itemID}`} className="text-decoration-none">
                  <div className="card product-card">
                    <img
                      src={product.imageURLs.length > 0 ? product.imageURLs[0] : null}
                      className="card-img-top"
                      alt={product.itemName}
                    />
                    <div className="card-body">
                      <h5 className="card-title">{product.itemName}</h5>
                      <div className="price-section">
                        <p className="regular-price">${product.price.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </Carousel>
        ) : (
          <p>No products found.</p>
        ) }
      </div>
    </section>
  );
};

export default Sale;
