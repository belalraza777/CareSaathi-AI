import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { useNavigate } from "react-router-dom";
import "./Signup.css";

// Manages signup form state and sends registration data through auth context.
const Signup = () => {
	const { handleRegister } = useAuth();
	const navigate = useNavigate();

	const [form, setForm] = useState({
		name: "",
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

		const result = await handleRegister(form);

		if (result.success) {
			setMessage(result.message || "Account created successfully");
			navigate("/profile");
		} else {
			setMessage(result.message || "Signup failed");
		}

		setLoading(false);
	};

	return (
		<div className="auth-page">
			<div className="auth-page__header">
				<h2>Create your account</h2>
				<p>Create an account with email. Google sign-in is available on Login.</p>
			</div>

			{/* Google OAuth is intentionally handled from Login page only. */}

			<form onSubmit={onSubmit}>
				<div className="auth-page__field">
					<label htmlFor="name">Name</label>
					<input
						id="name"
						type="text"
						name="name"
						value={form.name}
						onChange={onChange}
						required
					/>
				</div>

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
						minLength={6}
						required
					/>
				</div>

				<button type="submit" disabled={loading}>
					{loading ? "Creating account..." : "Create account"}
				</button>
			</form>

			{message && <p className="auth-page__message">{message}</p>}

			<p className="auth-page__switch">
				Already have an account?{" "}
				<Link to="/login">Login</Link>
			</p>
		</div>
	);
};

export default Signup;
