import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  HiOutlineExclamationCircle,
  HiOutlineLockClosed,
} from "react-icons/hi2";
import { HiOutlineMail } from "react-icons/hi";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, authError, setAuthError, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    const success = await login(email, password);
    if (success) {
      navigate("/profile");
    }
  };

  useEffect(() => {
    if (authError) setAuthError(null);
  }, [email, password, authError, setAuthError]);

  return (
    <div className="max-w-md w-full mx-auto bg-white p-8 sm:p-10 rounded-2xl shadow-2xl">
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
          Sign in to your account
        </h2>
      </div>

      {authError && (
        <div className="mt-6 flex items-start space-x-3 bg-red-50 text-red-700 p-3.5 rounded-lg border border-red-200">
          <HiOutlineExclamationCircle className="h-5 w-5 flex-shrink-0 text-red-500 mt-0.5" />
          <p className="text-sm">{authError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label
            htmlFor="email_login_page"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Email address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HiOutlineMail
                className="h-5 w-5 text-slate-400"
                aria-hidden="true"
              />
            </div>
            <input
              type="email"
              id="email_login_page"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg shadow-sm 
                         focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 
                         sm:text-sm text-slate-900 placeholder-slate-400
                         transition-shadow duration-150"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password_login_page"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HiOutlineLockClosed
                className="h-5 w-5 text-slate-400"
                aria-hidden="true"
              />
            </div>
            <input
              type="password"
              id="password_login_page"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg shadow-sm 
                         focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 
                         sm:text-sm text-slate-900 placeholder-slate-400
                         transition-shadow duration-150"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={authLoading}
          className="w-full inline-flex items-center justify-center py-3 px-4 text-sm sm:text-base font-semibold rounded-lg shadow-sm
                     bg-indigo-600 text-white hover:bg-indigo-700 
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 
                     active:bg-indigo-800
                     disabled:opacity-60 disabled:cursor-not-allowed 
                     transition-all duration-200 ease-in-out"
        >
          {authLoading ? "Logging in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-600">
        Not a member?{" "}
        <Link
          to="/signup"
          className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline"
        >
          Sign up now
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
