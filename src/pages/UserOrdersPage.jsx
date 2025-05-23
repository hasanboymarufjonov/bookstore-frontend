import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../services/apiService";

const UserOrdersPage = () => {
  const { user, isAuthenticated, isLoading: authIsLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 1
  );
  const [totalPages, setTotalPages] = useState(1);
  const ORDERS_PER_PAGE = 10;

  const fetchOrders = useCallback(
    async (pageNum) => {
      if (!isAuthenticated) return;

      setLoading(true);
      setError(null);
      try {
        const response = await apiService.getMyOrders({
          page: pageNum,
          limit: ORDERS_PER_PAGE,
        });
        setOrders(response.data || []);
        setTotalPages(response.totalPages || 1);
        if (
          pageNum > (response.totalPages || 1) &&
          (response.totalPages || 1) > 0
        ) {
          const lastValidPage = response.totalPages || 1;
          setCurrentPage(lastValidPage);
          const newSearchParams = new URLSearchParams(searchParams);
          newSearchParams.set("page", lastValidPage.toString());
          setSearchParams(newSearchParams, { replace: true });
        }
      } catch (err) {
        setError(err.message || "Failed to fetch your orders.");
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, searchParams, setSearchParams]
  );

  useEffect(() => {
    const urlPage = parseInt(searchParams.get("page")) || 1;
    if (urlPage !== currentPage) {
      setCurrentPage(urlPage);
    }
  }, [searchParams, currentPage]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders(currentPage);
    }
  }, [isAuthenticated, currentPage, fetchOrders]);

  if (authIsLoading || loading) {
    return <div className="spinner mx-auto my-10"></div>;
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-600 text-xl">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl max-w-4xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8">
        My Order History
      </h1>
      {orders.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-600 text-lg mb-4">
            You haven't placed any orders yet.
          </p>
          <Link
            to="/"
            className="py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-4 sm:p-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-indigo-600">
                    Order ID: {order.id}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Placed on: {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 text-xs sm:text-sm font-semibold rounded-full capitalize mt-2 sm:mt-0 ${
                    order.paymentStatus === "SUCCESSFUL"
                      ? "bg-green-100 text-green-700"
                      : order.paymentStatus === "PENDING"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {order.paymentStatus.toLowerCase().replace("_", " ")}
                </span>
              </div>
              <div className="mb-3">
                {order.book ? (
                  <p className="text-md text-gray-700">
                    Item: {order.book.name} (x{order.quantity})
                  </p>
                ) : (
                  <p className="text-md text-gray-700">
                    Book ID: {order.bookId} (x{order.quantity})
                  </p>
                )}
                <p className="text-md text-gray-700">
                  Total:{" "}
                  <span className="font-semibold">
                    ${order.totalPrice.toFixed(2)}
                  </span>
                </p>
              </div>
              {order.transactionId && (
                <p className="text-xs text-gray-500">
                  Transaction ID: {order.transactionId}
                </p>
              )}
              <Link
                to={`/orders/${order.id}`}
                className="inline-block mt-3 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                View Details &rarr;
              </Link>
            </div>
          ))}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-3 mt-8">
              <Button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || loading}
                variant="secondary"
                size="sm"
              >
                &larr; Previous
              </Button>
              <span className="text-gray-700 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages || loading}
                variant="secondary"
                size="sm"
              >
                Next &rarr;
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserOrdersPage;
