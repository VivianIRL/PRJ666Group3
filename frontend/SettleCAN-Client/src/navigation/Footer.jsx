import { Link } from "react-router-dom";
import "../scss/footer.scss";

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
            <li><Link to="/immigration-guide">Immigration Guide</Link></li>
            <li><Link to="/settlement-tips">Settlement Tips</Link></li>
            <li><Link to="/faqs">FAQs</Link></li>
          </ul>
        </div>

        <div>
          <h4>Support</h4>
          <ul>
            <li><Link to="/help">Help Center</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
        </div>

        <div>
          <h4>Legal</h4>
          <ul>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms of Use</Link></li>
          </ul>
        </div>
      </div>

      <p className="footer-note">© 2026 settleCAN. All rights reserved.</p>
    </footer>
  );
}
