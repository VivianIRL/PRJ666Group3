import { useContext } from "react";
import { AuthContext } from "../state/AuthContext";

export default function Options() {
  const { user, applyUser } = useContext(AuthContext);
  const { options } = user
  
  return (
    <section className="about-page">
      <div className="about-content">
        <h1>Settings</h1>

        <p>
          Modify your settings to use the website better.
        </p>
        
        <input type="checkbox"
            onChange={e => e}
        /> Dark Mode
      </div>
    </section>
  );
}