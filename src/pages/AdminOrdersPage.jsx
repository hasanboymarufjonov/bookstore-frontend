import { useEffect, useState, useCallback } from "react";
import { useSearchParams, Link as RouterLink } from "react-router-dom";
import { apiService } from "../services/apiService";

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 1
  );
  const [totalPages, setTotalPages] = useState(1);
  const ORDERS_PER_PAGE_ADMIN = 10;

  const fetchAllOrders = useCallback(
    async (pageNum) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiService.getMyOrders({
          page: pageNum,
          limit: ORDERS_PER_PAGE_ADMIN,
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
        setError(err.message || "Failed to fetch orders.");
      } finally {
        setLoading(false);
      }
    },
    [searchParams, setSearchParams]
  );

  useEffect(() => {
    const urlPage = parseInt(searchParams.get("page")) || 1;
    if (urlPage !== currentPage) setCurrentPage(urlPage);
  }, [searchParams, currentPage]);

  useEffect(() => {
    fetchAllOrders(currentPage);
  }, [currentPage, fetchAllOrders]);

  const paginationButtonClasses =
    "font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400 py-1.5 px-3 text-sm";

  if (loading && orders.length === 0)
    return <div className="spinner mx-auto my-10"></div>;
  if (error)
    return (
      <div className="text-center py-10 text-red-600 text-xl">
        Error: {error}
      </div>
    );

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8">
        All Customer Orders
      </h1>
      {orders.length === 0 ? (
        <p className="text-gray-600">No orders found in the system.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-indigo-600 font-medium">
                    {order.id}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {order.user?.email || "N/A"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-semibold">
                    ${order.totalPrice.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                        order.paymentStatus === "SUCCESSFUL"
                          ? "bg-green-100 text-green-800"
                          : order.paymentStatus === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {order.paymentStatus.toLowerCase().replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    <RouterLink
                      to={`/orders/${order.id}`}
                      className="text-indigo-600 hover:text-indigo-900 text-xs"
                    >
                      View
                    </RouterLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-3 mt-8">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1 || loading}
            className={paginationButtonClasses}
          >
            &larr; Previous
          </button>
          <span className="text-gray-700 text-sm">
            {" "}
            Page {currentPage} of {totalPages}{" "}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || loading}
            className={paginationButtonClasses}
          >
            Next &rarr;
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
