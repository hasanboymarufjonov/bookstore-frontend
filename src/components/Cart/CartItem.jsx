import { Link } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";

import { HiOutlinePlus, HiOutlineMinus, HiOutlineTrash } from "react-icons/hi2";

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  const iconButtonClasses =
    "p-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out";

  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5 md:gap-6 p-4 sm:p-5 border border-slate-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out">
      <Link
        to={`/books/${item.id}`}
        className="focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2 rounded-md flex-shrink-0 self-center sm:self-start"
      >
        <div className="relative w-28 h-40 sm:w-32 sm:h-44 md:w-36 md:h-[196px] rounded-md overflow-hidden ring-1 ring-slate-200">
          <img
            src={item.imageUrl}
            alt={`Cover of ${item.name}`}
            className="w-full h-full object-cover"
          />
        </div>
      </Link>

      {}
      <div className="flex-grow text-center sm:text-left">
        <Link to={`/books/${item.id}`} className="focus:outline-none group">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors duration-150 ease-in-out leading-tight">
            {item.name}
          </h2>
        </Link>
        <p className="text-indigo-600 font-semibold text-md sm:text-lg mt-1">
          ${item.price.toFixed(2)}
        </p>
        <p className="text-xs text-slate-500 mt-0.5">Unit Price</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:ml-auto gap-3 sm:gap-4 md:gap-5 mt-3 sm:mt-0 w-full sm:w-auto">
        <div className="flex items-center justify-center sm:justify-start space-x-2">
          <button
            type="button"
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
            aria-label={`Decrease quantity of ${item.name}`}
            className={`${iconButtonClasses} text-slate-500 hover:bg-slate-100 hover:text-slate-700`}
          >
            <HiOutlineMinus className="h-5 w-5" />
          </button>
          <span
            className="text-lg font-medium w-8 text-center tabular-nums text-slate-800"
            aria-live="polite"
            aria-atomic="true"
          >
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            aria-label={`Increase quantity of ${item.name}`}
            className={`${iconButtonClasses} text-slate-500 hover:bg-slate-100 hover:text-slate-700`}
          >
            <HiOutlinePlus className="h-5 w-5" />
          </button>
        </div>

        <p className="text-md sm:text-lg font-semibold text-slate-800 min-w-[5rem] sm:min-w-[6.5rem] text-center sm:text-right tabular-nums order-first sm:order-none">
          ${(item.price * item.quantity).toFixed(2)}
        </p>

        <button
          type="button"
          onClick={() => removeFromCart(item.id)}
          className={`${iconButtonClasses} text-red-500 hover:bg-red-100 hover:text-red-700 sm:ml-2`}
          aria-label={`Remove ${item.name} from cart`}
        >
          <HiOutlineTrash className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
