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

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article ref={ref} className="blog-card fade-in">
      <Link to={`/blog/${slug}`} className="blog-card-link">
        <h2 className="blog-card-title">{title}</h2>
        <time className="blog-card-date" dateTime={date}>
          {formattedDate}
        </time>
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
