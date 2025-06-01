import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../redux/apiRequests";
import { resetLoginError } from "../../redux/authSlice";
import "./login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loginError = useSelector(state => state.auth.login?.error);
  const loginMessage = useSelector(state => state.auth.login?.message);
  const isLoading = useSelector(state => state.auth.login?.isFetching);

  useEffect(() => {
    // Clear previous login state when component mounts
    dispatch(resetLoginError());
    
    // Clear when unmounting
    return () => {
      dispatch(resetLoginError());
    };
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
    if (loginError) {
      setIsSubmitting(false);
    }
  }, [loginError]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const user = {
      email: email,
      password: password
    };

    await loginUser(user, dispatch, navigate);
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <h1 className="login-title">Reddat</h1>
        <span className="beta-tag">BETA</span>
        <p className="login-subtitle">Sign In</p>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label>EMAIL</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label>PASSWORD</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>

          {loginError && loginMessage && (
            <div className="login-error">{loginMessage}</div>
          )}

          <div className="register-link">
            Don't have an account?
            <Link to="/register" className="register-link-text">
              Sign Up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
