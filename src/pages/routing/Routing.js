import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import './routing.css';
import { Route, Routes } from "react-router-dom";
import Home from "../components/Homepage/home";
import ProductPage from "../components/Homepage/ProductPage";
import ProductDetailPage from "../components/Homepage/ProductDetailPage";
import Cart from '../../pages/components/CartAndCheckout/cart/Cart'
import Checkout from '../components/CartAndCheckout/checkout/Checkout';
import Orders from '../components/CartAndCheckout/orders/Orders'
import Sale from '../components/Homepage/Sale';
import OrderConfirmation from '../components/CartAndCheckout/orders/orderConfirmation';
import TermsConditions from '../commoncomponents/TermsConditions';
import Profile from '../components/Profile/Profile';


export const Routing = () => {
  return (
    <div className="routing">
      <div className="navbarLayout">
        <Navbar />
      </div>
      <main className="content">

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductPage />} />
          <Route path="/product/:productId" element={<ProductDetailPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout/>} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/sale" element={<Sale />} />
          <Route path="/orderConfirmation" element={<OrderConfirmation/>} />
          <Route path="/terms" element={<TermsConditions/>} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
      <div className="footerLayout">
        <Footer />
      </div>
    </div>
  );
};
