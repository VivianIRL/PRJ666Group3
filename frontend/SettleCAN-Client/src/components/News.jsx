import "../scss/News.scss";
import news1 from "../assets/news1.png";
import news2 from "../assets/news2.png";
import news3 from "../assets/news3.png";

const newsItems = [
  {
    title: "New express entry draws announced",
    desc: "IRCC has announced new express entry draws with updated criteria.",
    img: news1,
  },
  {
    title: "Provincial Nominee Program Updates",
    desc: "Learn more about how provincial immigration programs have updated their requirements.",
    img: news2,
  },
  {
    title: "International Student Policy Changes",
    desc: "Recent visa and PGWP policy changes have been released.",
    img: news3,
  },
];

export default function News() {
  return (
    <section className="news">
      <h2>Latest Immigration News</h2>
      <div className="news-grid">
        {newsItems.map((n, i) => (
          <div key={i} className="news-card">
            <img src={n.img} alt={n.title} />
            <h3>{n.title}</h3>
            <p>{n.desc}</p>
            <a href="#">Read More</a>
          </div>
        ))}
      </div>
    </section>
  );
}
