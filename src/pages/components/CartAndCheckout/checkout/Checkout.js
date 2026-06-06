import React, { useEffect, useState } from 'react'
import './checkout.css'
import Shipping from './Shipping'
import Payment from './Payment'
import OrderSummary from './OrderSummary'
import { useDispatch, useSelector } from 'react-redux'
import { updateAddressData, updatecartBillData, updateCartData } from '../../../redux-toolkit/CartSlice'
import { getCartData } from '../../../commoncomponents/CommonFunctions'
import { useNavigate } from 'react-router-dom'
import Accordion from './Accordian'
import Loader from '../../../commoncomponents/Loading'
import ErrorBoundary from '../../../commoncomponents/ErrorBoundary'
import { VIBECART_URI } from '../../../commoncomponents/service';

const Checkout = () => {

  const [openSection, setOpenSection] = useState(['shipping']);
  const [loading, setLoading] = useState(true);

  const toggleAccordion = (type) => {
    if (openSection.includes(type)) {
      setOpenSection(prevOpenSection =>
        prevOpenSection.filter(x => x !== type)
      );
    } else {
      setOpenSection(prevOpenSection =>
        [...prevOpenSection, type]
      );
    }
  };


  const toggleAccordionOnContinue = () => {
    setOpenSection(prevOpenSection =>
      [prevOpenSection.filter(x => x !== "shipping"), "payment"]
    );
  };
  const dispatch = useDispatch()
  const { cartData, cartBillData, address } = useSelector((state) => state.cart);

  const navigate = useNavigate();

  const navigateTo = (path) => {
    navigate(path);
  }



  const fetchAndStoreDiscount = async () => {
    try {
      const response = await fetch(`${VIBECART_URI}/api/v1/vibe-cart/offers/bill`);
      if (response.ok) {
        const offers = await response.json();
        localStorage.setItem("cartOffers", JSON.stringify(offers));
        const storedData = JSON.parse(localStorage.getItem('billingData'));


        const totalBill = storedData.totalBill;
        const filterCorrectCartOffer = offers?.filter((x) => x.billAmount < totalBill);

        const closestOffer = filterCorrectCartOffer?.reduce((closest, offer) => {
          const distance = Math.abs(offer.billAmount - totalBill);
          return distance < Math.abs(closest.billAmount - totalBill) ? offer : closest;
        }, offers[0]);

        let discount = 0;
        if (closestOffer) {
          if (closestOffer.offerDiscountType === 'PERCENTAGE') {
            discount = (closestOffer.offerDiscountValue / 100) * totalBill;

          } else if (closestOffer.offerDiscountType === 'PRICE') {
            discount = closestOffer.offerDiscountValue;
          }
        }
        const newTotalBill = (totalBill - (discount || 0)) - (storedData?.promo || 0);

        const billingObject = { ...storedData, cartOffer: discount || 0, total: newTotalBill, promo: storedData?.promo || 0 }
        dispatch(updatecartBillData(billingObject));
        localStorage.setItem("billingData", JSON.stringify(billingObject));
      }
    } catch (error) {
      console.error('Failed to update billing data:', error);
    }
    finally {
      setLoading(false);
    }
  };

  const calculateTotalBill = () => {
    const getbillingdata = JSON.parse(localStorage.getItem("billingData"));

    if (getbillingdata && Object.keys(getbillingdata).length > 0) {
      fetchAndStoreDiscount();
    }
  }
  useEffect(() => {
    const { cartData, address } = getCartData();
    calculateTotalBill(cartData);
    dispatch(updateCartData(cartData));
    dispatch(updateAddressData(address));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (loading ? <Loader /> :
    <ErrorBoundary>

      <div className="checkout-container">
        <div className="checkout-component-layout">
          <div >
            <Accordion toggleAccordian={() => toggleAccordion("shipping")} isOpen={openSection.includes('shipping')} title="Shipping Address" >
              <Shipping address={address} toggleAccordionOnContinue={toggleAccordionOnContinue} />
            </Accordion>
          </div>
          {/* <div style={{ borderBottom: "1px solid rgba(0, 0, 0, 0.1)" }}>
          <Accordion toggleAccordian={() => toggleAccordion("offers")} isOpen={openSection.includes('offers')} title="Offers">
            <DeliveryAndGiftOptions />
          </Accordion>
        </div> */}
          <div >
            <Accordion toggleAccordian={() => toggleAccordion("payment")} isOpen={openSection.includes('payment')} title="Payment" >
              <Payment address={address} cartBillData={cartBillData} />
            </Accordion>
          </div>
        </div>
        <div className="checkout-order-container"><OrderSummary cartData={cartData} cartBillData={cartBillData} navigateTo={navigateTo} /></div>
      </div>
    </ErrorBoundary>
  )
}

export default Checkout;