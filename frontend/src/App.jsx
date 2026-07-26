import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CardsPage from "./pages/CardsPage";
import ContactsPage from "./pages/ContactsPage";
import InvitePage from "./pages/InvitePage";
import NetworkDashboardPage from "./pages/NetworkDashboardPage";
import AlertButton from "./components/crisis/AlertButton";
import { useAuth } from "./context/AuthContext";
import EmergencyProfilePage from "./pages/EmergencyProfilePage";
import PublicProfilePage from "./pages/PublicProfilePage";

function HomeRedirect(){const {user,authReady}=useAuth();if(!authReady)return null;return <Navigate to={user?.role==="reseau"?"/network-dashboard":user?"/cards":"/login"} replace/>}
function PatientLayout(){const {user}=useAuth();return <>{user?.role==="autiste"&&<AlertButton/>}<ProtectedRoute roles={["autiste"]}/></>}
export default function App(){return <BrowserRouter><AuthProvider><Routes><Route path="/login" element={<LoginPage/>}/><Route path="/register" element={<RegisterPage/>}/><Route path="/invite/:token" element={<InvitePage/>}/><Route path="/public/:publicId" element={<PublicProfilePage/>}/><Route element={<PatientLayout/>}><Route path="/cards" element={<CardsPage/>}/><Route path="/network" element={<ContactsPage/>}/><Route path="/profile" element={<EmergencyProfilePage/>}/></Route><Route element={<ProtectedRoute roles={["reseau"]}/> }><Route path="/network-dashboard" element={<NetworkDashboardPage/>}/></Route><Route path="*" element={<HomeRedirect/>}/></Routes></AuthProvider></BrowserRouter>}
