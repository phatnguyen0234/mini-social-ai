import "./landing.css";
import phoneMockup from "../../assets/phone.png";
import { useNavigate } from "react-router-dom";
const LandingPage = () => {
  const navigate = useNavigate();  const goToSignIn = () => {
    navigate("/login", { replace: true });
  };
  const goToSignUp = () => {
    navigate("/register", { replace: true });
  };
  return (
    <section className="landing-container">
      <div className="landing-header"> Reddat <span className="beta"> Beta </span> </div>
      <div className="landing-sub"> Definitely not Reddit</div>
      <img src={phoneMockup} className="phone-mockup" alt="phone mockup" />
      <div className="button-container">
        <button className="login" onClick={goToSignIn}>
          Sign in
        </button>
        <button className="register" onClick={goToSignUp}>
          Sign up
        </button>
      </div>
    </section>
  );
};

export default LandingPage;
