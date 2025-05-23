import { useEffect, useState } from "react";
import { useParams, Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { apiService } from "../services/apiService";

import {
  HiOutlineShoppingCart,
  HiOutlineArrowLeft,
  HiOutlineExclamationCircle,
} from "react-icons/hi2";
import { HiOutlineDocumentSearch } from "react-icons/hi";

const Loader = () => (
  <div className="flex justify-center items-center py-20">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
  </div>
);

const BookDetailPage = () => {
  const { id: bookId } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const baseButtonClasses =
    "inline-flex items-center justify-center font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 ease-in-out";

  const sizeMdClasses = "py-2 px-4 text-sm sm:text-base";

  const primaryButtonVariantClasses =
    "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 active:bg-indigo-800";

  const outlineButtonVariantClasses =
    "border border-indigo-600 text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500 active:bg-indigo-100";

  useEffect(() => {
    if (!bookId) {
      setError("No book ID provided.");
      setLoading(false);
      return;
    }
    const fetchBook = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedBook = await apiService.getBookById(bookId);
        setBook(fetchedBook);
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to fetch book details.";
        setError(errorMessage);
        console.error("Error fetching book by ID:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [bookId]);

  const handleActualAddToCart = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/books/${bookId}` } });
      return;
    }
    if (book) {
      addToCart(book, 1);
      alert(`"${book.name}" has been added to your cart!`);
    }
  };

  if (loading) return <Loader />;

  if (error)
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <HiOutlineExclamationCircle className="mx-auto h-16 w-16 text-red-500 mb-6" />
        <p className="text-2xl font-semibold text-red-600 mb-2">
          Oops! Something went wrong.
        </p>
        <p className="text-slate-600 mb-8">{error}</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className={`${baseButtonClasses} ${sizeMdClasses} ${outlineButtonVariantClasses} mt-6`}
        >
          Go Back
        </button>
      </div>
    );

  if (!book)
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <HiOutlineDocumentSearch className="mx-auto h-16 w-16 text-slate-400 mb-6" />
        <p className="text-2xl font-semibold text-slate-700 mb-2">
          Book Not Found
        </p>
        <p className="text-slate-500 mb-8">
          We couldn't find the book you're looking for. It might have been
          removed or the link is incorrect.
        </p>
        <RouterLink
          to="/"
          className={`${baseButtonClasses} ${sizeMdClasses} ${primaryButtonVariantClasses} mt-6`}
        >
          Go to Homepage
        </RouterLink>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="bg-white p-6 sm:p-10 rounded-xl shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12">
          <div className="md:col-span-2 relative w-full aspect-[3/4] rounded-lg overflow-hidden ring-1 ring-slate-200">
            <img
              src={book.imageUrl}
              alt={`Cover of ${book.name}`}
              className="w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-105"
            />
          </div>
          <div className="md:col-span-3 flex flex-col">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-3 leading-tight">
              {book.name}
            </h1>
            <p className="text-lg text-slate-600 mb-1">
              by{" "}
              <span className="font-medium text-indigo-600">
                {book.author || "Unknown Author"}
              </span>
            </p>
            <p className="text-4xl font-extrabold text-indigo-600 my-5">
              ${typeof book.price === "number" ? book.price.toFixed(2) : "N/A"}
            </p>
            <div className="mb-6 flex-grow">
              <h2 className="text-xl font-semibold text-slate-800 mb-2 border-b pb-2">
                Description
              </h2>
              <div className="prose prose-slate prose-lg max-w-none text-slate-700">
                <p>{book.description || "No description available."}</p>
              </div>
            </div>
            <div className="mt-auto pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={handleActualAddToCart}
                className={`${baseButtonClasses} w-full sm:w-auto py-3.5 px-8 text-base ${primaryButtonVariantClasses}`}
                disabled={loading}
              >
                <HiOutlineShoppingCart className="h-5 w-5 mr-2.5" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
        <div className="mt-10 sm:mt-12 text-center md:text-left">
          <RouterLink
            to="/"
            className="inline-flex items-center text-indigo-700 hover:text-indigo-900 transition-colors duration-150 group text-sm font-medium"
          >
            <HiOutlineArrowLeft className="h-4 w-4 mr-2 transition-transform duration-200 ease-in-out group-hover:-translate-x-1" />{" "}
            {}
            Back to Shopping
          </RouterLink>
        </div>
      </div>
    </div>
  );
};

export default BookDetailPage;
