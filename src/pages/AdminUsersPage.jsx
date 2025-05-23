import { useEffect, useState, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../services/apiService";

const AdminUsersPage = () => {
  const { user, isAuthenticated, isLoading: authIsLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState({ type: "", text: "" });

  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 1
  );
  const [totalPages, setTotalPages] = useState(1);
  const USERS_PER_PAGE = 10;

  const fetchUsers = useCallback(
    async (pageNum) => {
      setLoading(true);
      setError(null);
      setActionMessage({ type: "", text: "" });
      try {
        const response = await apiService.adminGetUsers({
          page: pageNum,
          limit: USERS_PER_PAGE,
        });
        setUsers(response.data || []);
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
        setError(err.message || "Failed to fetch users.");
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    },
    [searchParams, setSearchParams]
  );

  useEffect(() => {
    const urlPage = parseInt(searchParams.get("page")) || 1;
    if (urlPage !== currentPage) {
      setCurrentPage(urlPage);
    }
  }, [searchParams, currentPage]);

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage, fetchUsers]);

  const handleBlockToggle = async (userId, isCurrentlyBlocked) => {
    setActionMessage({ type: "", text: "" });
    const action = isCurrentlyBlocked
      ? apiService.adminUnblockUser
      : apiService.adminBlockUser;
    const actionText = isCurrentlyBlocked ? "Unblocked" : "Blocked";
    try {
      await action(userId);
      setActionMessage({
        type: "success",
        text: `User ${actionText.toLowerCase()} successfully.`,
      });

      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === userId ? { ...u, isBlocked: !isCurrentlyBlocked } : u
        )
      );
    } catch (err) {
      console.error(`Failed to ${actionText.toLowerCase()} user:`, err);
      setActionMessage({
        type: "error",
        text: `Failed to ${actionText.toLowerCase()} user: ${
          err.data?.message || err.message
        }`,
      });
    }
  };

  const paginationButtonClasses =
    "font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400 py-1.5 px-3 text-sm";

  if (loading && users.length === 0)
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
        Manage Users
      </h1>

      {actionMessage.text && (
        <div
          className={`p-4 mb-4 rounded-md text-sm ${
            actionMessage.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {actionMessage.text}
        </div>
      )}

      {users.length === 0 ? (
        <p className="text-gray-600">No users found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((usr) => (
                <tr key={usr.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {usr.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {usr.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {usr.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        usr.isBlocked
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {usr.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleBlockToggle(usr.id, usr.isBlocked)}
                      className={`py-1 px-3 rounded-md text-xs ${
                        usr.isBlocked
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : "bg-red-500 hover:bg-red-600 text-white"
                      }`}
                    >
                      {usr.isBlocked ? "Unblock" : "Block"}
                    </button>
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
            Page {currentPage} of {totalPages}
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

export default AdminUsersPage;
