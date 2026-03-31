import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/authContext";
import AppLayout from "../components/layout/AppLayout";
import Login from "../pages/Auth/Login";
import Signup from "../pages/Auth/Signup";
import Home from "../pages/Home/Home";
import Profile from "../pages/Profile/Profile";
import Consultation from "../pages/Consultation/Consultation";
import NewConsultation from "../pages/Consultation/NewConsultation";
import OAuthSuccess from "../pages/Auth/Oauth_success";


function AppRoutes() {
	const { isAuthenticated } = useAuth();

	return (
		<Routes>
			<Route element={<AppLayout />}>
				<Route
					path="/"
					element={isAuthenticated ? <Home /> : <Navigate to="/login" replace />}
				/>
				<Route
					path="/profile"
					element={isAuthenticated ? <Profile /> : <Navigate to="/login" replace />}
				/>

				<Route
					path="/consultation/new"
					element={isAuthenticated ? <NewConsultation /> : <Navigate to="/login" replace />}
				/>
				<Route
					path="/consultation/chat/:consultationId"
					element={isAuthenticated ? <Consultation /> : <Navigate to="/login" replace />}
				/>
				<Route
					path="/login"
					element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
				/>
				<Route
					path="/signup"
					element={isAuthenticated ? <Navigate to="/" replace /> : <Signup />}
				/>
				<Route path="/oauth-success" element={<OAuthSuccess />} />

				{/* Keeps unmatched URLs routed through the auth-aware home flow. */}
				<Route path="*" element={<Navigate to="/" replace />} />
			</Route>
		</Routes>
	);
}

export default AppRoutes;
