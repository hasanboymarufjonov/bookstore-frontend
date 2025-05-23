import { Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import CartItemComponent from "../components/Cart/CartItem";

import {
  HiOutlineShoppingCart,
  HiOutlineTrash,
  HiArrowRight,
  HiOutlineArrowLeft,
  HiOutlineCreditCard,
} from "react-icons/hi2";

const Loader = ({ message = "Loading your cart..." }) => (
  <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center px-4">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
    <p className="text-lg text-slate-600">{message}</p>
  </div>
);

const CartPage = () => {
  const { cartItems, getTotalPrice, clearCart, getItemCount, isCartLoading } =
    useCart();

  if (isCartLoading) {
    return <Loader />;
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[calc(100vh-15rem)] flex flex-col items-center justify-center text-center py-12 px-4 sm:px-6 lg:px-8">
        <HiOutlineShoppingCart className="h-28 w-28 text-slate-300 mb-8" />
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-5">
          Your Cart is Empty
        </h1>
        <p className="text-slate-600 mb-10 max-w-md mx-auto text-sm sm:text-base">
          Looks like you haven't added any books to your cart yet. Explore our
          collection and find your next great read!
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center py-3 px-7 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-150 text-base"
        >
          Start Shopping <HiArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-8 sm:my-12">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-6 border-b border-slate-200">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3 sm:mb-0">
            Your Cart ({getItemCount()} item{getItemCount() > 1 ? "s" : ""})
          </h1>
          {cartItems.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="inline-flex items-center justify-center text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 px-3 py-1.5 rounded-md transition-colors duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed mt-2 sm:mt-0"
            >
              <HiOutlineTrash className="h-4 w-4 mr-1.5" />
              Clear Cart
            </button>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="space-y-6">
            {cartItems.map((item) => (
              <CartItemComponent key={item.id || item._id} item={item} />
            ))}
          </div>
        )}

        {cartItems.length > 0 && (
          <div className="mt-10 border-t-2 border-slate-200 pt-8">
            <div className="flex flex-col items-end space-y-4 max-w-md ml-auto">
              <div className="flex justify-between items-baseline w-full">
                <span className="text-md text-slate-600">Subtotal:</span>
                <span className="text-lg text-slate-800 font-semibold">
                  ${getTotalPrice().toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-baseline w-full">
                <span className="text-sm text-slate-500">Shipping:</span>
                <span className="text-sm text-slate-500">
                  Calculated at checkout
                </span>
              </div>
              <div className="flex justify-between items-baseline w-full font-bold text-xl mt-2 pt-3 border-t border-slate-300 border-dashed">
                <span className="text-slate-800">Total:</span>
                <span className="text-indigo-600">
                  ${getTotalPrice().toFixed(2)}
                </span>
              </div>
            </div>
            <div className="mt-10 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
              <Link
                to="/"
                className="inline-flex items-center justify-center py-2.5 px-5 border border-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-150 w-full sm:w-auto text-center text-sm"
              >
                <HiOutlineArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Link>
              <Link
                to="/checkout"
                className="inline-flex items-center justify-center py-2.5 px-5 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-150 w-full sm:w-auto text-center text-sm"
              >
                <HiOutlineCreditCard className="h-4 w-4 mr-2" />
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
