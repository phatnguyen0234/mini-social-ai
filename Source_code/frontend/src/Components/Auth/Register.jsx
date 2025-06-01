import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../../redux/apiRequests";
import "./register.css";

const Register = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get states from Redux store
  const error = useSelector((state) => state.auth.register?.message);
  const isLoading = useSelector((state) => state.auth.register?.isFetching);
  const isSuccess = useSelector((state) => state.auth.register?.success);

  // Reset states when starting new registration
  const resetStates = () => {
    dispatch({ type: "auth/registerReset" }); // Reset Redux state
    setFormErrors({}); // Reset form errors
    setIsSubmitting(false); // Reset submission state
  };

  // Clear registration state on component mount
  useEffect(() => {
    resetStates();
  }, []); // Empty dependency array means this runs once on mount

  // Reset loading state after timeout or when error occurs
  useEffect(() => {
    let timeoutId;
    
    if (error) {
      setIsSubmitting(false); // Reset button state when error occurs
    }
    
    if (isLoading) {
      timeoutId = setTimeout(() => {
        if (isSubmitting) {
          setIsSubmitting(false);
          dispatch({
            type: "auth/registerFailed",
            payload: "Registration request timed out. Please try again."
          });
        }
      }, 15000); // 15 seconds timeout
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isLoading, dispatch, isSubmitting, error]);

  const validateForm = () => {
    const errors = {};
    
    if (!email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Invalid email format";
    }
    
    if (!username) {
      errors.username = "Username is required";
    } else if (username.length < 6) {
      errors.username = "Username must be at least 6 characters";
    } else if (username.length > 20) {
      errors.username = "Username must be less than 20 characters";
    }
    
    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent multiple submissions
    
    // Reset all states before new submission
    resetStates();
    
    console.log("Form submitted with:", { email, username, password });
    
    if (validateForm()) {
      setIsSubmitting(true);
      const newUser = {
        email: email,
        username: username,
        password: password,
      };
      console.log("Validation passed, sending data:", newUser);
      await registerUser(newUser, dispatch, navigate);
    } else {
      console.log("Form validation failed:", formErrors);
    }
  };

  // Reset form handler
  const handleInputChange = (setter, field) => (e) => {
    setter(e.target.value);
    setFormErrors(prev => ({ ...prev, [field]: "" }));
    if (error) resetStates(); // Reset error state when user starts typing
  };

  return (
    <div className="register-container">
      {/* Add hidden form to prevent autofill */}
      <form id="fakeform" style={{ display: 'none' }}>
        <input type="text" id="fake-username" name="fakeusername" />
        <input type="password" id="fake-password" name="fakepassword" />
      </form>
      
      <div className="register-wrapper">
        <h2 className="register-title">Create Account</h2>
        <form 
          onSubmit={handleSubmit} 
          className="register-form" 
          autoComplete="off"
          data-lpignore="true"
        >
          <div className="form-group">
            <label htmlFor="email">EMAIL</label>
            <input
              type="email"
              id="email"
              name="no-email"
              placeholder="Enter your email"
              value={email}
              onChange={handleInputChange(setEmail, 'email')}
              className={formErrors.email ? "error" : ""}
              disabled={isSubmitting}
              autoComplete="new-password"
              data-lpignore="true"
            />
            {formErrors.email && <div className="field-error">{formErrors.email}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="username">USERNAME</label>
            <input
              type="text"
              id="username"
              name="no-username"
              placeholder="Enter your username"
              value={username}
              onChange={handleInputChange(setUsername, 'username')}
              className={formErrors.username ? "error" : ""}
              disabled={isSubmitting}
              autoComplete="new-password"
              data-lpignore="true"
            />
            {formErrors.username && <div className="field-error">{formErrors.username}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">PASSWORD</label>
            <input
              type="password"
              id="password"
              name="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={handleInputChange(setPassword, 'password')}
              className={formErrors.password ? "error" : ""}
              disabled={isSubmitting}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              data-lpignore="true"
              aria-autocomplete="none"
              aria-label="password"
              aria-hidden="true"
            />
            {formErrors.password && <div className="field-error">{formErrors.password}</div>}
          </div>

          <button 
            type="submit" 
            className={`register-button ${isSubmitting ? 'loading' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Account..." : "Sign Up"}
          </button>

          {/* Display server error message */}
          {error && !isSuccess && (
            <div className="server-error">
              {error}
            </div>
          )}

          {/* Display success message */}
          {isSuccess && error && (
            <div className="success-message">
              {error}
              <Link 
                to="/login" 
                className="login-button"
              >
                Sign In Now
              </Link>
            </div>
          )}
        </form>

        <div className="login-link">
          Already have an account?
          <Link to="/login" className="login-link-text">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
