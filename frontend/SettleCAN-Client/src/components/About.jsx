import "../scss/About.scss";
import groupPicture from "../assets/group-picture.png";

export default function About() {
  return (
    <section id="about" className="about" style={{ display: "flex", alignItems: "center" }}>
      <div className="about-text">
        <h2>About settleCAN</h2>
        <p>
          SettleCAN helps newcomers and international students navigate Canada with confidence.
          Instead of digging through dozens of government websites, we give you clear,
          step‑by‑step guidance for everything you need — from getting your SIN and opening a
          bank account to understanding study permit rules, healthcare, work eligibility, and PR pathways.
        </p>
        <p>
          Our platform is built on verified, up‑to‑date information from trusted Canadian sources,
          so you never have to worry about outdated advice or misinformation. With personalized
          checklists, deadline reminders, and easy‑to‑follow workflows, SettleCAN keeps you organized,
          informed, and on track from the moment you arrive.
        </p>

        <p>
          Created by newcomers, for newcomers — we make your Canadian journey simpler, safer, and stress‑free.
        </p>
      </div>
      <img src={groupPicture} alt="Community group" />
    </section>
  );
}
