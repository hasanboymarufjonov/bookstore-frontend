import { BASE_URL } from "../config/api";

const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken");
  }
  return null;
};

const fetcher = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (token && !options.isPublic) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (options.body instanceof FormData) {
    delete headers["Content-Type"];
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: response.statusText, statusCode: response.status };
    }
    console.error("API Service Error:", errorData);
    const errorMessage = Array.isArray(errorData.message)
      ? errorData.message.join(", ")
      : errorData.message;
    const error = new Error(errorMessage || "An API error occurred");
    error.status = response.status;
    error.data = errorData;
    throw error;
  }
  if (
    response.status === 204 ||
    response.headers.get("content-length") === "0"
  ) {
    return null;
  }
  return response.json();
};

export const apiService = {
  login: (credentials) =>
    fetcher("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
      isPublic: true,
    }),
  signup: (userData) =>
    fetcher("/auth/signup", {
      method: "POST",
      body: JSON.stringify(userData),
      isPublic: true,
    }),
  getProfile: () => fetcher("/users/me"),
  getBooks: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params)
        .filter(([, value]) => value !== undefined)
        .map(([k, v]) => [k, String(v)])
    ).toString();
    return fetcher(`/books${query ? `?${query}` : ""}`, { isPublic: true });
  },
  getBookById: (id) => fetcher(`/books/${id}`, { isPublic: true }),
  createOrder: (orderData) =>
    fetcher("/orders", { method: "POST", body: JSON.stringify(orderData) }),
  getMyOrders: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params)
        .filter(([, value]) => value !== undefined)
        .map(([k, v]) => [k, String(v)])
    ).toString();
    return fetcher(`/orders/my-orders${query ? `?${query}` : ""}`);
  },
  getMyOrderById: (id) => fetcher(`/orders/my-orders/${id}`),
  adminGetStatistics: () => fetcher("/admin/statistics"),
  adminGetUsers: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params)
        .filter(([, value]) => value !== undefined)
        .map(([k, v]) => [k, String(v)])
    ).toString();
    return fetcher(`/admin/users${query ? `?${query}` : ""}`);
  },
  adminBlockUser: (userId) =>
    fetcher(`/admin/users/${userId}/block`, { method: "PATCH" }),
  adminUnblockUser: (userId) =>
    fetcher(`/admin/users/${userId}/unblock`, { method: "PATCH" }),
};
