import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import BookCard from "../components/Books/BookCard";
import { apiService } from "../services/apiService";

import { HiOutlineMagnifyingGlass, HiOutlineXCircle } from "react-icons/hi2";

const Loader = () => (
  <div className="flex justify-center items-center py-10">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
  </div>
);

const HomePage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentAppliedSearch, setCurrentAppliedSearch] = useState("");
  const BOOKS_PER_PAGE = 8;

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const urlPage = parseInt(searchParams.get("page")) || 1;
    const urlSearch = searchParams.get("search") || "";
    setPage(urlPage);
    setSearchTerm(urlSearch);
    setCurrentAppliedSearch(urlSearch);
  }, [searchParams]);

  const fetchBooks = useCallback(
    async (pageNum, searchVal) => {
      setLoading(true);
      setError(null);
      try {
        const params = { page: pageNum, limit: BOOKS_PER_PAGE };
        if (searchVal && searchVal.trim() !== "") {
          params.search = searchVal.trim();
        }
        const response = await apiService.getBooks(params);
        setBooks(response.data || []);
        setTotalPages(response.totalPages || 1);

        if (
          pageNum > (response.totalPages || 1) &&
          (response.totalPages || 1) > 0
        ) {
          const lastValidPage = response.totalPages || 1;
          setPage(lastValidPage);
          const newSearchParams = new URLSearchParams(searchParams);
          newSearchParams.set("page", lastValidPage.toString());
          if (searchVal) newSearchParams.set("search", searchVal);
          else newSearchParams.delete("search");
          setSearchParams(newSearchParams, { replace: true });
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to fetch books.";
        setError(errorMessage);
        console.error("Error fetching books:", err);
      } finally {
        setLoading(false);
      }
    },
    [searchParams, setSearchParams]
  );

  useEffect(() => {
    fetchBooks(page, currentAppliedSearch);
  }, [page, currentAppliedSearch, fetchBooks]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && !loading) {
      setPage(newPage);
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set("page", newPage.toString());
      if (currentAppliedSearch) {
        newSearchParams.set("search", currentAppliedSearch);
      } else {
        newSearchParams.delete("search");
      }
      setSearchParams(newSearchParams);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setCurrentAppliedSearch(searchTerm.trim());
    const newSearchParams = new URLSearchParams();
    newSearchParams.set("page", "1");
    if (searchTerm.trim()) {
      newSearchParams.set("search", searchTerm.trim());
    }
    setSearchParams(newSearchParams);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setCurrentAppliedSearch("");
    setPage(1);
    const newSearchParams = new URLSearchParams();
    newSearchParams.set("page", "1");
    setSearchParams(newSearchParams);
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <header className="mb-10 md:mb-16 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight">
          Explore Our Collection
        </h1>
        <p className="mt-3 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto">
          Find your next favorite read from our selection of books.
        </p>
      </header>

      <form
        onSubmit={handleSearchSubmit}
        className="mb-10 md:mb-12 max-w-xl mx-auto"
      >
        <div className="relative shadow-md rounded-xl">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <HiOutlineMagnifyingGlass className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, author, or ISBN..."
            className="w-full py-3.5 pl-12 pr-4 border border-slate-300 rounded-xl 
                       focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                       transition-colors duration-150 ease-in-out 
                       placeholder-slate-400 text-slate-800"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
              aria-label="Clear input"
            >
              <HiOutlineXCircle className="h-5 w-5" />
            </button>
          )}
        </div>
        <div className="flex items-center justify-start space-x-3 mt-4">
          <button
            type="submit"
            className="inline-flex items-center justify-center font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 ease-in-out py-2 px-4 text-sm sm:text-base bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 active:bg-indigo-800"
            disabled={loading || !searchTerm.trim()}
          >
            Search
          </button>
          {currentAppliedSearch && (
            <button
              type="button"
              onClick={clearSearch}
              className="inline-flex items-center justify-center font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 ease-in-out py-1.5 px-3 text-xs sm:text-sm bg-transparent text-slate-600 hover:text-indigo-700 hover:bg-indigo-100 focus:ring-indigo-500 active:bg-indigo-200"
              disabled={loading}
            >
              Clear Results
            </button>
          )}
        </div>
      </form>

      {loading && books.length === 0 && <Loader />}
      {error && (
        <div className="text-center py-10 px-4">
          <p className="text-xl text-red-600 font-semibold">Error: {error}</p>
          <button
            type="button"
            onClick={() => fetchBooks(page, currentAppliedSearch)}
            className="inline-flex items-center justify-center font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 ease-in-out py-2 px-4 text-sm sm:text-base bg-slate-200 text-slate-800 hover:bg-slate-300 focus:ring-slate-500 active:bg-slate-400 mt-4"
          >
            Try Again
          </button>
        </div>
      )}
      {!loading && !error && books.length === 0 && (
        <div className="text-center py-16 px-4">
          <HiOutlineMagnifyingGlass className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <p className="text-2xl font-semibold text-slate-700">
            No Books Found
          </p>
          <p className="text-slate-500 mt-1">
            {currentAppliedSearch
              ? `We couldn't find any books matching "${currentAppliedSearch}".`
              : "Try adjusting your search or browse our collection."}
          </p>
          {currentAppliedSearch && (
            <button
              type="button"
              onClick={clearSearch}
              className="inline-flex items-center justify-center font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 ease-in-out py-2 px-4 text-sm sm:text-base border border-indigo-600 text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500 active:bg-indigo-100 mt-6"
            >
              Clear Search and Show All Books
            </button>
          )}
        </div>
      )}

      {!error && books.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {books.map((book) => (
              <BookCard key={book.id || book._id} book={book} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-3 mt-12 sm:mt-16">
              <button
                type="button"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1 || loading}
                className="inline-flex items-center justify-center font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 ease-in-out py-1.5 px-3 text-xs sm:text-sm border border-indigo-600 text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500 active:bg-indigo-100"
              >
                &larr; Previous
              </button>
              <span className="text-slate-700 font-medium text-sm px-2 py-1.5 bg-slate-100 rounded-md">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages || loading}
                className="inline-flex items-center justify-center font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 ease-in-out py-1.5 px-3 text-xs sm:text-sm border border-indigo-600 text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500 active:bg-indigo-100"
              >
                Next &rarr;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HomePage;
