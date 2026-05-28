import { useContext } from "react";
import "../scss/Hero.scss";
import { UserContext } from "../UserContext";

export default function Hero() {
    // eslint-disable-next-line no-unused-vars
    const { user, setUser } = useContext(UserContext)
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Welcome to SettleCAN</h1>
        <p>
          Your comprehensive platform for navigating Canadian immigration and settlement.
          All the information you need, in one place.
        </p>
        <div className="hero-buttons">
          <button className="btn-light">Get Started</button>
          <button className="btn-dark">Learn More</button>
        </div>
      </div>
    </section>
  );
}
