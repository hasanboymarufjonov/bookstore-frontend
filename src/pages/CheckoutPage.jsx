import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { apiService } from "../services/apiService";

import {
  HiOutlineExclamationCircle,
  HiOutlineCreditCard,
  HiOutlineArrowLeft,
  HiOutlineReceiptPercent,
  HiOutlineClipboardDocumentList,
} from "react-icons/hi2";

const Loader = ({ message = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center px-4">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
    <p className="text-lg text-slate-600">{message}</p>
  </div>
);

const CheckoutPage = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { cartItems, getTotalPrice, clearCart, isCartLoading } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isCartLoading) {
      if (!isAuthenticated) navigate("/login");
      else if (cartItems.length === 0 && !orderSuccess) navigate("/cart");
    }
  }, [
    authLoading,
    isCartLoading,
    isAuthenticated,
    cartItems,
    navigate,
    orderSuccess,
  ]);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!user || cartItems.length === 0) return;

    const orderItemsDetails = cartItems.map((item) => ({
      bookId: item.id,
      quantity: item.quantity,
      price: item.price,
    }));

    setIsProcessing(true);
    setError(null);
    setOrderSuccess(null);
    try {
      const orderData = {
        userId: user.id,
        items: orderItemsDetails,
        totalAmount: getTotalPrice(),
        paymentDetails: {
          cardNumber: cardNumber.slice(-4),
          cardType: "mock_visa",
        },
      };

      const mockApiOrderData = {
        bookId: cartItems[0].id,
        quantity: cartItems[0].quantity,
        cardNumber,
        cardExpiry,
        cardCvc,
      };
      const createdOrder = await apiService.createOrder(mockApiOrderData);
      setOrderSuccess(createdOrder);
      clearCart();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.data?.message ||
          err.message ||
          "Failed to place order. Please check your details and try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading || (isCartLoading && cartItems.length > 0)) {
    return <Loader message="Loading checkout details..." />;
  }

  if (!isAuthenticated) {
    return <Loader message="Redirecting to login..." />;
  }
  if (cartItems.length === 0 && !orderSuccess) {
    return <Loader message="Your cart is empty. Redirecting..." />;
  }

  const inputFieldClasses =
    "block w-full px-4 py-2.5 mt-1 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 placeholder-slate-400 transition-shadow duration-150";
  const inputLabelClasses = "block text-sm font-medium text-slate-700 mb-1";

  return (
    <div className="max-w-2xl mx-auto my-8 sm:my-12 bg-white p-6 sm:p-10 rounded-2xl shadow-2xl">
      <div className="text-center mb-10">
        <HiOutlineCreditCard className="mx-auto h-16 w-16 text-indigo-600" />
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-4 tracking-tight">
          Secure Checkout
        </h1>
      </div>

      {orderSuccess ? (
        <div className="text-center py-10">
          <svg
            className="w-20 h-20 text-green-500 mx-auto mb-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <h2 className="text-2xl sm:text-3xl font-semibold text-green-700 mb-3">
            Order Placed Successfully!
          </h2>
          <p className="text-slate-600 text-sm">Thank you for your purchase.</p>
          <div className="mt-6 bg-slate-50 p-4 rounded-lg text-left space-y-1 text-sm">
            <p className="text-slate-700">
              <span className="font-medium">Order ID:</span>{" "}
              {orderSuccess.id || "N/A"}
            </p>
            <p className="text-slate-700">
              <span className="font-medium">Transaction ID:</span>{" "}
              {orderSuccess.transactionId || "N/A"}
            </p>
            <p className="text-slate-700 pt-2 border-t border-slate-200 mt-2">
              An email confirmation has been sent to{" "}
              <span className="font-medium text-indigo-600">
                {user?.email || "your email address"}
              </span>
              .
            </p>
          </div>
          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link
              to="/profile"
              className="inline-flex items-center justify-center py-2.5 px-5 border border-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-150 w-full sm:w-auto text-center text-sm"
            >
              <HiOutlineClipboardDocumentList className="h-4 w-4 mr-2" />
              View My Orders
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center py-2.5 px-5 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-150 w-full sm:w-auto text-center text-sm"
            >
              <HiOutlineArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-8 p-5 border border-slate-200 rounded-lg bg-slate-50">
            <h2 className="text-xl font-semibold text-slate-700 mb-4 flex items-center">
              <HiOutlineReceiptPercent className="h-6 w-6 mr-2 text-indigo-600" />{" "}
              Order Summary
            </h2>
            <div className="space-y-2 text-sm">
              {cartItems.map((item) => (
                <div
                  key={item.id || item._id}
                  className="flex justify-between items-center text-slate-600 py-1.5 border-b border-slate-200 last:border-b-0"
                >
                  <span>
                    {item.name}{" "}
                    <span className="text-xs">(x{item.quantity})</span>
                  </span>
                  <span className="font-medium text-slate-700">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold text-lg text-slate-800 mt-4 pt-3 border-t-2 border-slate-300">
              <span>Total to Pay:</span>
              <span className="text-indigo-600">
                ${getTotalPrice().toFixed(2)}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmitOrder} className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-700 flex items-center">
              <HiOutlineCreditCard className="h-6 w-6 mr-2 text-indigo-600" />{" "}
              Payment Details (Mock)
            </h2>
            {error && (
              <div
                className="flex items-start space-x-3 bg-red-50 text-red-700 p-3.5 rounded-lg border border-red-200"
                role="alert"
              >
                <HiOutlineExclamationCircle className="h-5 w-5 flex-shrink-0 text-red-500 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}
            <div>
              <label
                htmlFor="cardNumber_checkout_page"
                className={inputLabelClasses}
              >
                Card Number
              </label>
              <input
                type="text"
                id="cardNumber_checkout_page"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                required
                className={inputFieldClasses}
                placeholder="0000 0000 0000 0000"
                pattern="[\d\s]{13,19}"
                title="Enter a valid card number (13-19 digits)."
              />
            </div>
            <div className="grid grid-cols-2 gap-x-4 sm:gap-x-6">
              <div>
                <label
                  htmlFor="cardExpiry_checkout_page"
                  className={inputLabelClasses}
                >
                  Expiry (MM/YY)
                </label>
                <input
                  type="text"
                  id="cardExpiry_checkout_page"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  required
                  placeholder="MM/YY"
                  className={inputFieldClasses}
                  pattern="\d{2}\/\d{2}"
                  title="Enter expiry date in MM/YY format."
                />
              </div>
              <div>
                <label
                  htmlFor="cardCvc_checkout_page"
                  className={inputLabelClasses}
                >
                  CVC
                </label>
                <input
                  type="text"
                  id="cardCvc_checkout_page"
                  value={cardCvc}
                  onChange={(e) => setCardCvc(e.target.value)}
                  required
                  placeholder="123"
                  className={inputFieldClasses}
                  pattern="\d{3,4}"
                  title="Enter the 3 or 4 digit CVC."
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing || cartItems.length === 0}
              className="w-full mt-2 inline-flex items-center justify-center py-3 px-4 text-sm sm:text-base font-semibold rounded-lg shadow-md
                         bg-indigo-600 text-white hover:bg-indigo-700 
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 
                         active:bg-indigo-800
                         disabled:opacity-60 disabled:cursor-not-allowed 
                         transition-all duration-200 ease-in-out"
            >
              {isProcessing
                ? "Placing Order..."
                : `Place Order & Pay $${getTotalPrice().toFixed(2)}`}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default CheckoutPage;
