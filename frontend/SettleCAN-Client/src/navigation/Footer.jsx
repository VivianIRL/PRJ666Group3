import "../scss/Footer.scss";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <h3>settleCAN</h3>
          <p>Helping newcomers adapt, integrate, and thrive in Canada.</p>
        </div>

        <div>
          <h4>Resources</h4>
          <ul>
            <li>Immigration Guide</li>
            <li>Settlement Tips</li>
            <li>FAQs</li>
          </ul>
        </div>

        <div>
          <h4>Support</h4>
          <ul>
            <li>Help Center</li>
            <li>Contact Us</li>
          </ul>
        </div>

        <div>
          <h4>Legal</h4>
          <ul>
            <li>Privacy Policy</li>
            <li>Terms of Use</li>
          </ul>
        </div>
      </div>

      <p className="footer-note">© 2026 settleCAN. All rights reserved.</p>
    </footer>
  );
}
