import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../services/apiService";
import {
  HiOutlineChartPie,
  HiOutlineUsers,
  HiOutlineBookOpen,
  HiOutlineShoppingCart,
  HiOutlineCurrencyDollar,
  HiOutlineExclamationCircle,
  HiOutlineLockClosed,
  HiOutlineDocumentText,
  HiOutlineTableCells,
} from "react-icons/hi2";

const Loader = ({ message = "Loading data..." }) => (
  <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center px-4">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
    <p className="text-lg text-slate-600">{message}</p>
  </div>
);

const StatusDisplay = ({ icon, title, message, children }) => (
  <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center px-6 py-10">
    {icon && <div className="mb-5 text-slate-400">{icon}</div>}
    <h2 className="text-2xl font-semibold text-slate-700 mb-2">{title}</h2>
    {message && <p className="text-slate-500 max-w-md">{message}</p>}
    {children && <div className="mt-6">{children}</div>}
  </div>
);

const AdminDashboardPage = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || user?.role !== "ADMIN") {
        return;
      } else {
        const fetchStats = async () => {
          setLoading(true);
          setError(null);
          try {
            const data = await apiService.adminGetStatistics();
            setStats(data);
          } catch (err) {
            setError(
              err.response?.data?.message ||
                err.message ||
                "Failed to load statistics."
            );
            console.error("Error fetching stats:", err);
          } finally {
            setLoading(false);
          }
        };
        fetchStats();
      }
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  if (authLoading || (!user && !authLoading)) {
    return <Loader message="Verifying access..." />;
  }

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return (
      <StatusDisplay
        icon={<HiOutlineLockClosed className="h-16 w-16 text-red-500" />}
        title="Access Denied"
        message="You do not have permission to view this page."
      />
    );
  }

  if (loading) {
    return <Loader message="Loading dashboard statistics..." />;
  }

  if (error) {
    return (
      <StatusDisplay
        icon={<HiOutlineExclamationCircle className="h-16 w-16 text-red-500" />}
        title="Error Loading Data"
        message={error}
      />
    );
  }
  if (!stats) {
    return (
      <StatusDisplay
        icon={<HiOutlineDocumentText className="h-16 w-16" />}
        title="No Statistics Available"
        message="There are currently no statistics to display. Please check back later."
      />
    );
  }

  const statItems = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      color: "bg-sky-600",
      icon: HiOutlineUsers,
    },
    {
      label: "Total Books",
      value: stats.totalBooks,
      color: "bg-emerald-600",
      icon: HiOutlineBookOpen,
    },
    {
      label: "Successful Orders",
      value: stats.totalSuccessfulOrders,
      color: "bg-amber-500",
      icon: HiOutlineShoppingCart,
    },
    {
      label: "Total Revenue",
      value: `$${stats.totalRevenue?.toFixed(2) || "0.00"}`,
      color: "bg-violet-600",
      icon: HiOutlineCurrencyDollar,
    },
  ];

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 pb-4 border-b border-slate-200">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4 sm:mb-0">
          Admin Dashboard
        </h1>
        <HiOutlineChartPie className="h-10 w-10 text-indigo-600 hidden sm:block" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 sm:mb-12">
        {statItems.map((item) => (
          <div
            key={item.label}
            className={`p-6 rounded-xl shadow-lg text-white ${item.color} flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:scale-[1.02]`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium uppercase tracking-wider opacity-90">
                {item.label}
              </div>
              {item.icon && <item.icon className="h-7 w-7 opacity-80" />}
            </div>
            <div className="text-4xl font-semibold truncate">{item.value}</div>
          </div>
        ))}
      </div>

      {stats.mostPopularBooks && stats.mostPopularBooks.length > 0 && (
        <div>
          <div className="flex items-center mb-6">
            <HiOutlineTableCells className="h-7 w-7 text-indigo-600 mr-3" />
            <h2 className="text-2xl font-semibold text-slate-700">
              Most Popular Books
            </h2>
          </div>
          <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                  >
                    Book Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                  >
                    Total Orders
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {stats.mostPopularBooks.map((book) => (
                  <tr
                    key={book.bookId || book.name}
                    className="hover:bg-slate-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                      {book.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {book.orderCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
