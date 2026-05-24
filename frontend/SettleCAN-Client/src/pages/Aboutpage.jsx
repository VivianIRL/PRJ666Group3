// src/pages/AboutPage.jsx
import "../scss/AboutPage.scss";
import aboutImage from "../assets/about-image.avif";

export default function AboutPage() {
  return (
    <section className="about-page">
      <div className="about-content">
        <h1>About settleCAN</h1>

        <p>
          SettleCAN is your trusted companion for navigating life in Canada as a newcomer or
          international student. Instead of searching through dozens of government websites,
          forums, and outdated advice, SettleCAN brings everything together in one clear,
          easy‑to‑follow place.
        </p>

        <p>
          We turn complex settlement tasks—like getting your SIN, opening a bank account,
          accessing healthcare, understanding your study permit rules, or planning your PR
          pathway—into simple, step‑by‑step guidance you can actually follow.
        </p>

        <p>
          Our platform is built on verified information from official sources such as IRCC,
          Service Canada, provincial health authorities, and educational institutions. You get
          accurate, up‑to‑date instructions without the confusion or guesswork.
        </p>

        <p>
          Created by newcomers, for newcomers, SettleCAN is designed to reduce stress, save
          time, and help you feel confident as you build your life in Canada.
        </p>
      </div>

      <div className="about-image">
        <img src={aboutImage} alt="Newcomers in Canada" />
      </div>
    </section>
  );
}
