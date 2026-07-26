import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CardsPage from "./pages/CardsPage";

export default function App(){return <BrowserRouter><AuthProvider><Routes><Route path="/login" element={<LoginPage/>}/><Route path="/register" element={<RegisterPage/>}/><Route element={<ProtectedRoute/>}><Route path="/cards" element={<CardsPage/>}/></Route><Route path="*" element={<Navigate to="/cards" replace/>}/></Routes></AuthProvider></BrowserRouter>}
