import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
export default function ProtectedRoute({ roles }) {
  const { user, isAuthenticated, authReady } = useAuth();
  if (!authReady) return <main className="session-loading"><div className="brand">Bridge<span>.</span></div><p>Vérification de votre session…</p></main>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={user.role === "reseau" ? "/network-dashboard" : "/cards"} replace />;
  return <Outlet />;
}
