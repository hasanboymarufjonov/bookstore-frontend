import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../services/apiService";

const UserOrderDetailPage = () => {
  const { orderId } = useParams();
  const { isAuthenticated, isLoading: authIsLoading } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !orderId) {
      if (!authIsLoading && !isAuthenticated) {
        setError("You must be logged in to view order details.");
        setLoading(false);
      }
      if (!orderId && !authIsLoading) {
        setError("Order ID is missing.");
        setLoading(false);
      }
      return;
    }

    const fetchOrderDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiService.getMyOrderById(orderId);
        setOrder(data);
      } catch (err) {
        console.error("Error fetching order detail:", err);
        setError(err.message || "Failed to fetch order details.");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && orderId) {
      fetchOrderDetail();
    }
  }, [orderId, isAuthenticated, authIsLoading]);

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

  if (!order) {
    return (
      <div className="text-center py-10 text-xl">
        Order not found or you do not have permission to view it.
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "SUCCESSFUL":
        return "bg-green-100 text-green-700";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      case "FAILED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Order Details
        </h1>
        <Link to="/orders" className="text-sm text-indigo-600 hover:underline">
          &larr; Back to My Orders
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-6">
        <div>
          <p className="text-sm font-medium text-gray-500">Order ID</p>
          <p className="text-lg text-gray-900">{order.id}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Date Placed</p>
          <p className="text-lg text-gray-900">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Payment Status</p>
          <span
            className={`px-3 py-1 text-sm font-semibold rounded-full capitalize ${getStatusColor(
              order.paymentStatus
            )}`}
          >
            {order.paymentStatus.toLowerCase().replace("_", " ")}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Order Total</p>
          <p className="text-lg font-bold text-indigo-600">
            ${order.totalPrice.toFixed(2)}
          </p>
        </div>
        {order.transactionId && (
          <div className="md:col-span-2">
            <p className="text-sm font-medium text-gray-500">Transaction ID</p>
            <p className="text-md text-gray-700 break-all">
              {order.transactionId}
            </p>
          </div>
        )}
        {order.cardNumberLastFour && (
          <div className="md:col-span-2">
            <p className="text-sm font-medium text-gray-500">Payment Method</p>
            <p className="text-md text-gray-700">
              Card ending in •••• {order.cardNumberLastFour}
            </p>
          </div>
        )}
      </div>

      <h2 className="text-xl font-semibold text-gray-700 mt-8 mb-4 pt-4 border-t">
        Item Ordered
      </h2>
      {order.book ? (
        <div className="flex flex-col sm:flex-row items-start sm:space-x-4 p-4 border border-gray-200 rounded-lg">
          <div className="relative w-24 h-36 sm:w-28 sm:h-40 flex-shrink-0 mb-4 sm:mb-0 rounded overflow-hidden">
            <img
              src={order.book.imageUrl}
              alt={order.book.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-grow">
            <Link
              to={`/books/${order.book.id}`}
              className="hover:text-indigo-600"
            >
              <h3 className="text-lg font-semibold text-gray-800">
                {order.book.name}
              </h3>
            </Link>
            <p className="text-sm text-gray-600">Quantity: {order.quantity}</p>
            <p className="text-sm text-gray-600">
              Price per unit: ${(order.totalPrice / order.quantity).toFixed(2)}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-gray-600">
          Book details not available for this order.
        </p>
      )}
    </div>
  );
};

export default UserOrderDetailPage;
