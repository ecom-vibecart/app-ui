import React, { useState, useEffect } from 'react';
import { IoCartOutline } from 'react-icons/io5';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { FaRegUserCircle } from "react-icons/fa";
import axios from 'axios';
import './layout.css';
import { useDispatch, useSelector } from 'react-redux';
import { getCartData } from '../../commoncomponents/CommonFunctions';
import { updateCartData } from '../../redux-toolkit/CartSlice';
import { VIBECART_URI } from '../../commoncomponents/service';

const Navbar = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [productData, setProductData] = useState([]);
    const [activeMenu, setActiveMenu] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const { cartData } = useSelector((state) => state.cart);

    const dispatch = useDispatch();

    useEffect(() => {
        axios.get(`${VIBECART_URI}/api/v1/vibe-cart/app/items`)
            .then((response) => {
                setProductData(response.data);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            });
    }, []);

    useEffect(() => {
        if (searchTerm.trim()) {
            const filteredSuggestions = productData
                .filter(product =>
                    product.itemName.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .slice(0, 4); // Limit suggestions to 4
            setSuggestions(filteredSuggestions);
        } else {
            setSuggestions([]);
        }
    }, [searchTerm, productData]);

    useEffect(() => {
        setSuggestions([]);
    }, [location]);

    useEffect(() => {
        const { cartData } = getCartData();
        dispatch(updateCartData(cartData));
    }, [dispatch])

    const handleSearch = (e) => {
        e.preventDefault(); // Prevent default form submission
        if (searchTerm) {
            navigate(`/products?searchquery=${searchTerm}`);
        }
    };

    const handleNavigate = (path, category = '', menuName = '') => {
        const url = category ? `${path}?category=${category}` : path;
        navigate(url);
        setActiveMenu(menuName); // Set the active menu item
    };

    const handleSuggestionClick = (itemID, itemName) => {
        setSearchTerm(itemName);
        setSuggestions([]);
        navigate(`/product/${itemID}`, { replace: true });
    };

    const defaultImage = 'https://via.placeholder.com/50';

    return (
        <div>
            <div className='nav_head container'>
                <header className="navbar-container d-flex justify-content-between align-items-center">
                    <div className="navbar-title" onClick={() => handleNavigate('/', '', 'Home')}>
                        <span className='half'>VIBE</span>CART
                    </div>
                    <form className="navbar-search" onSubmit={handleSearch}>
                        <div className="search-container">
                            <input
                                type="search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search"
                                className="navbar-search-input"
                            />
                            <FaSearch className="search-icon" size={20} onClick={handleSearch} />
                        </div>
                        {searchTerm && suggestions.length > 0 && (
                            <div className="suggestions-list">
                                {suggestions.map((suggestion) => (
                                    <div
                                        key={suggestion.itemID}
                                        onClick={() => handleSuggestionClick(suggestion.itemID, suggestion.itemName)}
                                        className="suggestion-item d-flex align-items-center"
                                    >
                                        <img
                                            src={suggestion.imageURLs.length > 0 ? `http://${suggestion.imageURLs[0]}` : defaultImage}
                                            alt={suggestion.itemName}
                                            className="suggestion-image"
                                        />
                                        <div className="suggestion-text">
                                            <div className="suggestion-name">{suggestion.itemName}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </form>
                    <div className="navbar-icons d-flex align-items-center">
                        <div className="navbar-icon" onClick={() => handleNavigate('/profile')}>
                            <FaRegUserCircle className="user-icon" size={28} color='#dd1e25' />
                        </div>
                        <div className="navbar-icon cart-icon" onClick={() => handleNavigate('/cart')}>
                            <IoCartOutline size={32} color='#dd1e25' />
                            {cartData?.length > 0 && (
                                <span className="cart-item-count">{cartData?.length}</span>
                            )}
                        </div>
                    </div>
                </header>
            </div>
            <nav className="menuBorder">
                <div className="navbar__menu container">
                    <p
                        onClick={() => handleNavigate('/', '', 'Home')}
                        className={activeMenu === 'Home' ? 'active' : ''}
                    >
                        Home
                    </p>
                    <p
                        onClick={() => handleNavigate('/products', 'jackets', 'Jackets')}
                        className={activeMenu === 'Jackets' ? 'active' : ''}
                    >
                        Jackets
                    </p>
                    <p
                        onClick={() => handleNavigate('/products', 'shoes', 'Shoes')}
                        className={activeMenu === 'Shoes' ? 'active' : ''}
                    >
                        Shoes
                    </p>
                    {/* <p
                        className='sale'
                        onClick={() => handleNavigate('/sale', '', 'Sale')}
                    >
                        Sale
                    </p> */}
                </div>
            </nav>
        </div>
    );
};

export default Navbar;
