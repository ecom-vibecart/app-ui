import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { setSelectedProduct, addToCart } from '../../redux-toolkit/productDetailSlice';
import '../Homepage/ProductDetailPage.css';
import Breadcrumbs from '../Homepage/Breadcrumbs';
import { MdLocalOffer } from "react-icons/md";
import { updateCartData } from '../../redux-toolkit/CartSlice';
import { VIBECART_URI } from '../../commoncomponents/service';

// Default image if none is provided
const defaultImage = 'https://via.placeholder.com/600x400';

// Function to format date with ordinal suffix
const formatDateWithOrdinal = (dateString) => {
  const date = new Date(dateString.data);
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();
  const ordinalSuffix = (day) => {
    if (day >= 11 && day <= 13) return 'th'; // Special cases for 11, 12, 13
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

    return `${day}${ordinalSuffix(day)} ${month} ${year}`;
};

const ProductDetailPage = () => {
  const { productId } = useParams();
  const dispatch = useDispatch();
  const product = useSelector((state) => state.productDetail.selectedProduct);

  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [skuID, setSkuID] = useState('');
  const [currentImage, setCurrentImage] = useState(defaultImage);
  const [offersByItemID, setOffersByItemID] = useState([]);
  const [offersBySKU, setOffersBySKU] = useState([]);
  const [zipcode, setZipcode] = useState('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [stockQuantity, setStockQuantity] = useState(null);
  const [outOfStockMessage, setOutOfStockMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [offerPrice, setOfferPrice] = useState(null);
  const [formattedExpecteddeliverydate, setFormattedExpectedDeliveryDate] = useState('')


  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        let response;
        let url = '';
 
        // if (productId <1000900) {
          // Handle itemId
          url = `${VIBECART_URI}/api/v1/vibe-cart/app/items/item/${productId}`;
          response = await axios.get(url);
        // } else {
        //   // Handle skuId
        //   url = `${VIBECART_URI}/api/v1/vibe-cart/app/products/product/sku-id/${productId}`;
        //   response = await axios.get(url);
        // }

        const productData = response.data;
        dispatch(setSelectedProduct(productData));
        if (url === `${VIBECART_URI}/api/v1/vibe-cart/app/items/item/${productId}`) {
          setCurrentImage(productData.imageURLs[0] ? productData.imageURLs[0] : defaultImage);
        } else {
          setCurrentImage(productData.imageURL ? productData.imageURL : defaultImage);
        }
        setSkuID(productData.skuID || ''); // Set initial SKU ID if available
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product details:', error);
        setError('Failed to load product details.');
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId, dispatch]);


  useEffect(() => {
    const fetchSkuDetails = async () => {
      if (selectedColor && selectedSize && product) {
        try {
          const response = await axios.get(`${VIBECART_URI}/api/v1/vibe-cart/app/products/product/item-id/${product.itemID}`, {
            params: { color: selectedColor, size: selectedSize }
          });
          const { skuID, imageURL } = response.data;
          setSkuID(skuID); // Update SKU ID
          setCurrentImage(imageURL);
          const stockResponse = await axios.get(`${VIBECART_URI}/api/v1/vibe-cart/scm/inventory/quantity-by-sku`, {
            params: { sku: skuID }
          });
          setStockQuantity(stockResponse.data.data ?? 0);
          setOutOfStockMessage(stockResponse.data.data <= 0 ? 'Out of stock' : '');
        } catch (error) {
          console.error('Error fetching SKU ID and image URL:', error);
        }
      }
    };

    fetchSkuDetails();
  }, [selectedColor, selectedSize, product]);

  useEffect(() => {
    const fetchOffersByItemID = async () => {
      if (product && product.itemID) {
        try {
          const response = await axios.get(`${VIBECART_URI}/api/v1/vibe-cart/offers/item/${product.itemID}`);
          const offers = response.data || [];
          setOffersByItemID(offers);

          // Compute offerPrice
          const offer = offers.find(o => o.offerDiscountType === 'PERCENTAGE');
          if (offer) {
            setOfferPrice(product.price * (1 - offer.offerDiscountValue / 100));
          }
        } catch (error) {
          console.error('Error fetching offers by itemID:', error);
          setOffersByItemID([]);
          setOfferPrice(null);
        }
      }
    };

    fetchOffersByItemID();
  }, [product,selectedColor,selectedSize]);
 
 
  useEffect(() => {
    const fetchOffersBySKU = async () => {
      if (skuID && product) {
        try {
          const response = await axios.get(`${VIBECART_URI}/api/v1/vibe-cart/offers/sku/${skuID}`);
          const offers = response.data || [];
          setOffersBySKU(offers);

          // Compute offerPrice
          const offer = offers.find(o => o.offerDiscountType === 'PERCENTAGE');
          if (offer) {
            setOfferPrice(product.price * (1 - offer.offerDiscountValue / 100));
          }
        } catch (error) {
          console.error('Error fetching offers by SKU:', error);
          setOffersBySKU([]);
          setOfferPrice(null);
        }
      }
    };

    fetchOffersBySKU();
  }, [skuID, product]);





  const fetchExpectedDeliveryDate = async () => {
    if (skuID && zipcode.length === 6) {
      try {
        const response = await axios.get(`${VIBECART_URI}/api/v1/vibe-cart/scm/inventory/expected-delivery-date`, {
          params: { sku: skuID, zipcode: zipcode }
        });
        setExpectedDeliveryDate(formatDateWithOrdinal(response.data));
        setFormattedExpectedDeliveryDate(response.data.data);
      } catch (error) {
        console.error('Error fetching expected delivery date:', error);
        setExpectedDeliveryDate('');
      }
    }
  };

  const handleZipcodeChange = (e) => {
    const value = e.target.value;
    setZipcode(value);

    if (value.length === 6) {
      fetchExpectedDeliveryDate();
    } else {
      setExpectedDeliveryDate('');
    }
  };

  const handleAddToCart = () => {
    if (selectedColor && selectedSize && product) {
      if (stockQuantity === null || stockQuantity <= 0) {
        setOutOfStockMessage('Out of stock');
        return;
      }

      const offerDetails = [...offersByItemID, ...offersBySKU].map((offer) => ({
        offerId: offer.offerId,
        offerName: offer.offerName,
        offerDiscountType: offer.offerDiscountType,
        offerDiscountValue: offer.offerDiscountValue,
        offerType: offer.offerType,
      }));

      const cartItem = {
        itemID: product.itemID,
        itemName: product.itemName,
        itemDescription: product.itemDescription,
        price: product.price,
        imageURL: currentImage,
        selectedColor,
        selectedSize,
        requestedQuantity: 1,
        categoryID: product.categoryID,
        categoryName: product.categoryName,
        skuID,
        totalAmountPerProduct: product.price,
        stockQuantity,
        zipcode,
        expectedDeliveryDate,
        formattedExpecteddeliverydate,
        offers: offerDetails // Added offers
      };

      let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

      const itemExists = cartItems.some((item) => item.skuID === cartItem.skuID);

      if (itemExists) {
        alert('This item with the same SKU ID is already in your cart.');
      } else {
        cartItems.push(cartItem);
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        dispatch(addToCart(cartItem));
        dispatch(updateCartData(cartItems));
        alert(`${product.itemName} in ${selectedColor} color and ${selectedSize} size has been added to your cart.`);
      }
    } else {
      alert('Please select a color and size.');
    }
  };

  if (loading) {
    return <div className="loading">Loading product details...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!product) {
    return <div className="error">Product not found.</div>;
  }

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Products', path: '/products' },
    { label: product.itemName, path: `/product/${productId}` },
  ];

  return (
    <div className="product-detail-page">
      <Breadcrumbs breadcrumbs={breadcrumbs} className="container" />
      <div className="container">
        <div className="row">
          {/* Image Gallery and Main Image */}
          <div className="col-md-6 both_images">
            <div className="image-gallery">
              {product.imageURLs?.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Thumbnail ${index + 1}`}
                  className={`thumbnail ${currentImage === url ? 'active' : ''}`}
                  onClick={() => setCurrentImage(url)}
                  onError={(e) => { e.target.onerror = null; e.target.src = defaultImage; }}
                />
              ))}
            </div>
            <div className="main-image">
              <img src={currentImage} alt={product.itemName} />
            </div>
          </div>

          {/* Product Details */}
          <div className="col-md-6 product-details">
            <h1>{product.itemName}</h1>
            {skuID && <h3 className="sku">SKU ID: {skuID}</h3>}
            <h4 className="category">Category: {product.categoryName}</h4>

            {/* Color Selection */}
            <div className="selection-group">
              <label htmlFor="color">Select Color:</label>
              <div className="color-options" id="color">
                {product.availableColors.map((color, index) => (
                  <button
                    key={index}
                    className={`color-swatch ${selectedColor === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                    aria-label={color}
                  />
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="selection-group">
              <label htmlFor="size">Select Size:</label>
              <div className="size-options" id="size">
                {product.availableSizes.map((size, index) => (
                  <button
                    key={index}
                    className={`size-button ${selectedSize === size ? 'selected' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>







            {/* Price Display */}
            <div className="price-section">
              {offerPrice !== null && offerPrice < product.price ? (
                <>
                  <div className='pipdiscounts'>
                    <h2 className="offer-price price">${offerPrice.toFixed(2)}</h2>
                    <h2 className="original-price  ">${product.price.toFixed(2)}</h2>
                  </div>
                </>
              ) : (
                <h2 className="price">${product.price.toFixed(2)}</h2>
              )}
            </div>

            {/* {outOfStockMessage && <p className="text-danger">{outOfStockMessage}</p>}
            <p className="description">{product.itemDescription}</p>
 
            
            {(offersByItemID.length > 0 || offersBySKU.length > 0) && (
              <div className="offers-section">
                <h3>Available Offers:</h3>
                <ul>
                  {[...offersByItemID, ...offersBySKU].map((offer) => (
                    <li key={offer.offerId}>
                      <MdLocalOffer style={{ color: '#8c0e12', fontSize: '20px', margin: '20px' }} />
                      {offer.offerName}: {offer.offerDiscountValue}
                      {offer.offerDiscountType === 'PERCENTAGE' ? '%' : '$'} off
                    </li>
                  ))}
                </ul>
              </div>
            )}
  */}





            {outOfStockMessage && <p className="text-danger">{outOfStockMessage}</p>}

            <p className="description">{product.itemDescription}</p>

            {/* Offers Section */}
            {/* {offersByItemID.length > 0 && (
              <div className="offers-section">
                <h3>Available Offers:</h3>
                <ul>
                  {offersByItemID.map((offer) => (
                    <div key={offer.offerId}>
                      <MdLocalOffer style={{ color: '#8c0e12', fontSize: '20px', margin: '20px' }} />
                      {offer.offerName}: {offer.offerDiscountValue}
                      {offer.offerDiscountType === 'PERCENTAGE' ? '%' : '$'} off
                    </div>
                  ))}
                </ul>
                  <div >
                      <MdLocalOffer style={{ color: '#8c0e12', fontSize: '20px', margin: '20px' }} />
                      {offersByItemID[0]?.offerName}: {offersByItemID[0]?.offerDiscountValue}
                      {offersByItemID[0]?.offerDiscountType === 'PERCENTAGE' ? '%' : '$'} off
                    </div>
              </div>
            )} */}

            {offersBySKU.length > 0 && (
              <div className="offers-section">
                <h4>Available Offers:</h4>
                  {/* {offersBySKU.map((offer) => (
                    <div key={offer.offerId}>
                      <MdLocalOffer style={{ color: '#8c0e12', fontSize: '20px', margin: '20px' }} />
                      {offer.offerName}: {offer.offerDiscountValue}
                      {offer.offerDiscountType === 'PERCENTAGE' ? '%' : '$'} off
                    </div>
                  ))} */}
                    <div >
                      <MdLocalOffer style={{ color: '#8c0e12', fontSize: '20px', margin: '20px' }} />
                      {offersBySKU[0]?.offerName}: {offersBySKU[0]?.offerDiscountValue}
                      {offersBySKU[0]?.offerDiscountType === 'PERCENTAGE' ? '%' : '$'} off
                    </div>
              </div>
            )}

            {/* Add to Cart Button */}
            <button className="add-to-cart" onClick={handleAddToCart}>
              Add to Cart
            </button>

            {/* Delivery Availability */}
            <div className="delivery-availability">
              <label htmlFor="zipcode">Delivery Availability:</label>
              <div>
                <div className="zipcode-input input-group">
                  <input
                    type="text"
                    id="zipcode"
                    placeholder="Enter Zip Code"
                    value={zipcode}
                    onChange={handleZipcodeChange}
                  />
                  <button type="button" className="check-availability" onClick={fetchExpectedDeliveryDate}>
                    Check
                  </button>
                </div>
                {expectedDeliveryDate && (
                  <p className="expected-delivery" style={{ marginTop: '10px', color: 'green' }}>
                    <span style={{ color: 'grey' }}>Expected Delivery:</span> {expectedDeliveryDate}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;