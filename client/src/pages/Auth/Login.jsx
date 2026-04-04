import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import "./Login.css";

// Manages login form state and submits credentials through auth context.
const Login = () => {
	const { handleLogin } = useAuth();
	const navigate = useNavigate();

	const [form, setForm] = useState({
		email: "",
		password: "",
	});
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");

	const onChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const onSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setMessage("");

		const result = await handleLogin(form);

		if (result.success) {
			setMessage(result.message || "Login successful");
			navigate("/");
		} else {
			setMessage(result.message || "Login failed");
		}

		setLoading(false);
	};

	// Keep OAuth endpoint in sync with backend base URL.
	const googleAuthUrl = useMemo(() => {
		const base = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
		return `${base.replace(/\/$/, "")}/auth/google`;
	}, []);

	return (
		<div className="auth-page">
			<div className="auth-page__header">
				<h2>Welcome back</h2>
				<p>Continue with Google for fastest access, or use your email and password.</p>
			</div>

			<div className="auth-page__oauth-priority">
				<span className="auth-page__priority-tag">Recommended</span>
				<a href={googleAuthUrl} className="auth-page__btn auth-page__btn--google">
					<FcGoogle />
					Continue with Google
				</a>
			</div>

			<div className="auth-page__divider">
				<span>or continue with email</span>
			</div>

			<form onSubmit={onSubmit}>
				<div className="auth-page__field">
					<label htmlFor="email">Email</label>
					<input
						id="email"
						type="email"
						name="email"
						value={form.email}
						onChange={onChange}
						required
					/>
				</div>

				<div className="auth-page__field">
					<label htmlFor="password">Password</label>
					<input
						id="password"
						type="password"
						name="password"
						value={form.password}
						onChange={onChange}
						required
					/>
				</div>

				<button type="submit" disabled={loading}>
					{loading ? "Logging in..." : "Login"}
				</button>
			</form>

			{message && <p className="auth-page__message">{message}</p>}
			<p className="auth-page__switch">
				Don&apos;t have an account?{" "}
				<Link to="/signup">Sign up</Link>
			</p>
		</div>
	);
};

export default Login;
