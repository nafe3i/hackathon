import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate("/login", { replace: true }); };
  const home = user?.role === "reseau" ? "/network-dashboard" : "/cards";
  return <header className="navbar"><NavLink className="brand navbar-brand" to={home}>Bridge<span>.</span></NavLink><nav>{user?.role==="autiste"?<><NavLink to="/cards" className={({isActive})=>isActive?"nav-link active":"nav-link"}>Mes cartes</NavLink><NavLink to="/network" className={({isActive})=>isActive?"nav-link active":"nav-link"}>Mon réseau</NavLink><NavLink to="/profile" className={({isActive})=>isActive?"nav-link active":"nav-link"}>Mon QR</NavLink></>:<NavLink to="/network-dashboard" className={({isActive})=>isActive?"nav-link active":"nav-link"}>Mes alertes</NavLink>}</nav><div className="navbar-account"><div className="avatar">{user?.username?.charAt(0).toUpperCase()}</div><span className="account-name">{user?.username}</span><button className="ghost" onClick={handleLogout}>Se déconnecter</button></div></header>;
}
