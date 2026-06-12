import { useContext } from "react";
import { AuthContext } from "../state/AuthContext";

export default function Options() {
  const { changeOptions } = useContext(AuthContext);
  
  return (
    <section className="about-page">
      <div className="about-content">
        <h1>Settings</h1>

        <p>
          Modify your settings to use the website better.
        </p>
        
        <input type="checkbox"
                  onChange={e => {
                      changeOptions({ "darkMode": e })
                  }}
        /> Dark Mode
      </div>
    </section>
  );
}