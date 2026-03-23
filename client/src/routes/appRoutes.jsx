import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/authContext";
import Login from "../pages/Auth/Login";
import Signup from "../pages/Auth/Signup";
import Home from "../pages/Home/Home";
import Profile from "../pages/Profile/Profile";

function AppRoutes() {
	const { isAuthenticated } = useAuth();

	return (
		<Routes>
			<Route
				path="/"
				element={isAuthenticated ? <Home /> : <Navigate to="/login" replace />}
			/>
			<Route
				path="/profile"
				element={isAuthenticated ? <Profile /> : <Navigate to="/login" replace />}
			/>
			<Route
				path="/login"
				element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
			/>
			<Route
				path="/signup"
				element={isAuthenticated ? <Navigate to="/" replace /> : <Signup />}
			/>
			{/* Keeps unmatched URLs routed through the auth-aware home flow. */}
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
}

export default AppRoutes;
