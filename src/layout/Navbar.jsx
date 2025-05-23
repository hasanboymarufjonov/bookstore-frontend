import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

import {
  HiOutlineShoppingCart,
  HiOutlineUserCircle,
  HiOutlineArrowLeftOnRectangle,
  HiOutlineArrowRightOnRectangle,
  HiOutlineUserPlus,
  HiOutlineCog6Tooth,
} from "react-icons/hi2";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { getItemCount, isCartLoading } = useCart();
  const navigate = useNavigate();
  const itemCount = getItemCount();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-slate-800 p-4 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          to="/"
          className="text-2xl font-bold text-indigo-400 hover:text-indigo-300 transition-colors duration-150 ease-in-out"
        >
          Bookstore
        </Link>
        <div className="flex items-center space-x-1 sm:space-x-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `hidden sm:inline-block px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
              }`
            }
          >
            Home
          </NavLink>

          {isAuthenticated ? (
            <>
              {user?.role === "ADMIN" && (
                <NavLink
                  to="/admin/dashboard"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out flex items-center ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-md"
                        : "text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`
                  }
                >
                  <HiOutlineCog6Tooth className="h-5 w-5" strokeWidth={1.5} />
                  <span className="ml-2 hidden sm:inline">Admin</span>
                </NavLink>
              )}
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out flex items-center ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`
                }
              >
                <HiOutlineUserCircle className="h-5 w-5" strokeWidth={1.5} />
                <span className="ml-2 hidden sm:inline">Profile</span>
              </NavLink>
              <Link
                to="/cart"
                className="px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out flex items-center text-slate-300 hover:bg-slate-700 hover:text-white relative p-2"
              >
                <HiOutlineShoppingCart className="h-5 w-5" strokeWidth={1.5} />
                {!isCartLoading && itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-semibold rounded-full h-5 min-w-[1.25rem] px-1 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out flex items-center text-slate-300 hover:bg-red-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
              >
                <HiOutlineArrowRightOnRectangle
                  className="h-5 w-5"
                  strokeWidth={1.5}
                />
                <span className="ml-2 hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out flex items-center ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`
                }
              >
                <HiOutlineArrowLeftOnRectangle
                  className="h-5 w-5"
                  strokeWidth={1.5}
                />
                <span className="ml-2">Login</span>
              </NavLink>
              <Link
                to="/signup"
                className="px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out flex items-center bg-indigo-500 text-white hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 shadow-md"
              >
                <HiOutlineUserPlus className="h-5 w-5" strokeWidth={1.5} />
                <span className="ml-2">Sign Up</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
