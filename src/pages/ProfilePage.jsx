import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  HiOutlineUserCircle,
  HiOutlineArchiveBox,
  HiOutlineExclamationTriangle,
  HiOutlineCalendarDays,
  HiOutlineEnvelope,
  HiOutlineIdentification,
  HiOutlineShieldCheck,
} from "react-icons/hi2";

const Loader = ({ message = "Loading Profile..." }) => (
  <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center px-4">
    <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-indigo-600 mb-3"></div>{" "}
    <p className="text-md text-slate-500">{message}</p>
  </div>
);

const ProfilePage = () => {
  const { user, isLoading: authIsLoading } = useAuth();

  if (authIsLoading || !user) {
    return <Loader />;
  }

  const InfoRow = ({ label, value, icon, children }) => (
    <div className="border-b border-slate-200 py-2.5 first:pt-0 last:border-b-0 last:pb-0">
      <p className="text-xs font-medium text-slate-500 mb-0.5 flex items-center">
        {icon && <span className="mr-1.5 text-slate-400">{icon}</span>}
        {label}
      </p>
      {children || (
        <p className="text-sm sm:text-base text-slate-700 break-words">
          {value}
        </p>
      )}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto my-4 sm:my-6 bg-white p-4 sm:p-6 rounded-xl shadow-xl">
      {" "}
      <div className="flex flex-col items-center mb-4 sm:mb-6">
        {" "}
        <HiOutlineUserCircle className="h-12 w-12 text-indigo-500 mb-2" />
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 text-center">
          My Profile
        </h1>
      </div>
      <div className="space-y-0.5">
        {" "}
        <InfoRow
          label="Email"
          value={user.email}
          icon={<HiOutlineEnvelope size={14} />}
        />
        <InfoRow label="Role" icon={<HiOutlineShieldCheck size={14} />}>
          <p className="text-sm sm:text-base text-slate-700 capitalize">
            {" "}
            <span
              className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                user.role === "ADMIN"
                  ? "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200"
                  : "bg-green-100 text-green-700 ring-1 ring-green-200"
              }`}
            >
              {user.role.toLowerCase()}
            </span>
          </p>
        </InfoRow>
        <InfoRow
          label="User ID"
          value={user.id}
          icon={<HiOutlineIdentification size={14} />}
        />
        <InfoRow
          label="Joined"
          value={new Date(user.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          icon={<HiOutlineCalendarDays size={14} />}
        />
        {user.isBlocked && (
          <div
            className="flex items-start bg-red-50 border-l-4 border-red-500 text-red-700 p-2.5 rounded-md mt-3"
            role="alert"
          >
            <HiOutlineExclamationTriangle className="h-5 w-5 mr-2 flex-shrink-0 text-red-600" />
            <div>
              <p className="font-bold text-red-800 text-sm">Account Status</p>{" "}
              <p className="text-xs">
                {" "}
                Your account is currently blocked. Please contact support.
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="mt-6 sm:mt-8 border-t border-slate-200 pt-4 sm:pt-6">
        {" "}
        <h2 className="text-lg sm:text-xl font-semibold text-slate-700 mb-2">
          My Orders
        </h2>
        <p className="text-slate-600 mb-4 text-xs sm:text-sm">
          Track your current orders or review your purchase history.
        </p>
        <Link
          to="/orders"
          className="inline-flex items-center justify-center w-full sm:w-auto py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-150 text-xs sm:text-sm"
        >
          <HiOutlineArchiveBox className="h-4 w-4 mr-1.5" />
          View My Orders
        </Link>
      </div>
    </div>
  );
};

export default ProfilePage;
