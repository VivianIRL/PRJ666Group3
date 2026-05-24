import "../scss/Features.scss";
import provincialResources from "../assets/provincial-resources.png";
import documentTracking from "../assets/document-tracking.png";
import timelinePlanning from "../assets/timeline-planning.png";
import communitySupport from "../assets/community-support.png";

const features = [
  { title: "Provincial Resources", desc: "Tailored information for each Canadian Province", img: provincialResources },
  { title: "Document Tracking", desc: "Keep track of all your important permits and papers", img: documentTracking },
  { title: "Timeline Planning", desc: "Personalized timelines for your settlement journey", img: timelinePlanning },
  { title: "Community Support", desc: "Connect with others on the same journey", img: communitySupport },
];

export default function Features() {
  return (
    <section className="features">
      {features.map((f, i) => (
        <div key={i} className="feature-card">
          <img src={f.img} alt={f.title} />
          <h3>{f.title}</h3>
          <p>{f.desc}</p>
        </div>
      ))}
    </section>
  );
}
