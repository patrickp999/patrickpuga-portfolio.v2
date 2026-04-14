import * as React from "react";
import { Link } from "gatsby";
import { useFadeIn } from "../utils/useFadeIn";

type BlogCardProps = {
  title: string;
  date: string;
  excerpt: string;
  slug: string;
  tags?: string[];
};

const BlogCard: React.FC<BlogCardProps> = ({ title, date, excerpt, slug, tags }) => {
  const ref = useFadeIn<HTMLElement>();
  const [likes, setLikes] = React.useState<number | null>(null);

  React.useEffect(() => {
    fetch(`/.netlify/functions/likes?slug=${slug}`)
      .then(r => r.json())
      .then(data => setLikes(data.likes))
      .catch(() => {});
  }, [slug]);

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article ref={ref} className="blog-card fade-in">
      <Link to={`/blog/${slug}`} className="blog-card-link">
        <h2 className="blog-card-title">{title}</h2>
        <div className="blog-card-meta">
          <time className="blog-card-date" dateTime={date}>
            {formattedDate}
          </time>
          {likes !== null && (
            <span className="blog-card-likes">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path
                  d="M12 21C12 21 3 15.5 3 9.5C3 7 4.5 5 7 5C9 5 11 6.5 12 8C13 6.5 15 5 17 5C19.5 5 21 7 21 9.5C21 15.5 12 21 12 21Z"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
              {likes}
            </span>
          )}
        </div>
        <p className="blog-card-excerpt">{excerpt}</p>
        {tags && tags.length > 0 && (
          <ul className="blog-card-tags">
            {tags.map((tag, idx) => (
              <li key={`${tag}-${idx}`} className="blog-card-tag">{tag}</li>
            ))}
          </ul>
        )}
      </Link>
    </article>
  );
};

export default BlogCard;
