import "../scss/Hero.scss";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Welcome to SettleCAN</h1>
        <p>
          Your comprehensive platform for navigating Canadian immigration and settlement.
          All the information you need, in one place.
        </p>
        <div className="hero-buttons">
          <button className="btn-light" data-testid="hero-get-started-btn">Get Started</button>
          <button className="btn-dark" data-testid="hero-learn-more-btn">Learn More</button>
        </div>
      </div>
    </section>
  );
}
