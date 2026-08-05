import "../scss/Features.scss";
import provincialResources from "../assets/provincial-resources.png";
import documentTracking from "../assets/document-tracking.png";
import timelinePlanning from "../assets/timeline-planning.png";
import communitySupport from "../assets/community-support.png";

const features = [
  { title: "Provincial Resources", desc: "Tailored information for each Canadian Province", img: provincialResources, color: "blue" },
  { title: "Document Tracking", desc: "Keep track of all your important permits and papers", img: documentTracking, color: "amber" },
  { title: "Timeline Planning", desc: "Personalized timelines for your settlement journey", img: timelinePlanning, color: "teal" },
  { title: "Community Support", desc: "Connect with others on the same journey", img: communitySupport, color: "purple" },
];

export default function Features() {
  return (
    <section className="features">
      {features.map((f, i) => (
        <div key={i} className={`feature-card feature-card--${f.color}`}>
          <div className="feature-card__icon">
            <img src={f.img} alt={f.title} />
          </div>
          <h3>{f.title}</h3>
          <p>{f.desc}</p>
        </div>
      ))}
    </section>
  );
}
