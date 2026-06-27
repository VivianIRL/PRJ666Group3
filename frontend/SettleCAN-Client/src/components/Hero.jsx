import { useContext } from "react";
import "../scss/Hero.scss";
import { AuthContext } from "../state/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const { isAuthenticated } = useContext(AuthContext) ?? {};
  let navigate = useNavigate(); 

  function handleStart(e) {
    e.preventDefault();
    if (isAuthenticated) {
      navigate("/dashboard")
    } else {
      navigate("/register")
    }
  }

  function handleLearnMore(e) {
    e.preventDefault();
    if (isAuthenticated) {
      navigate("/dashboard")
    } else {
      navigate("/about")
    }
  }

  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Welcome to SettleCAN</h1>
        <p>
          Your comprehensive platform for navigating Canadian immigration and settlement.
          All the information you need, in one place.
        </p>
        <div className="hero-buttons">
          <button className="btn-light" onClick={handleStart}>Get Started</button>
          <button className="btn-dark" onClick={handleLearnMore}>Learn More</button>
        </div>
      </div>
    </section>
  );
}
