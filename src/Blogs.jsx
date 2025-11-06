// Blogs.jsx (dynamic list)
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Blogs.css";
import { getPublicBlogPosts } from "./api";

export default function Blogs() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    getPublicBlogPosts(1, 12)
      .then((res) => setPosts(res?.items || []))
      .catch((e) => console.error("Failed to fetch blogs", e));
  }, []);

  return (
    <div className="blogs-page">
      <div className="blogs-hero">
        <div className="blogs-hero-content">
          <h1>Blog & Resources</h1>
          <p>Insights, tips, and best practices for email verification and deliverability</p>
        </div>
      </div>

      <div className="blogs-container">
        <div className="blogs-grid">
          {posts.map((post) => (
            <Link key={post.slug} to={`/blogs/${post.slug}`} className="blog-card-link">
              <article className="blog-card">
                <div className="blog-image">
                  <img src={post.cover_image_url || "/document.png"} alt={post.title} />
                  <span className="blog-category">{post.category || "Article"}</span>
                </div>

                <div className="blog-content">
                  <div className="blog-meta">
                    <span className="blog-date">
                      {post.published_at ? new Date(post.published_at).toLocaleDateString() : ""}
                    </span>
                    <span className="blog-separator">•</span>
                    <span className="blog-read-time">{post.readTime || "5 min read"}</span>
                  </div>

                  <h2 className="blog-title">{post.title}</h2>
                  <p className="blog-excerpt">{post.excerpt}</p>

                  <div className="blog-footer">
                    <span className="blog-author">By {post.author_name}</span>
                    <span className="blog-read-more">
                      Read More
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        <div className="blogs-cta">
          <h2>Ready to clean your email list?</h2>
          <p>Start verifying emails today with 250 free credits</p>
          <Link to="/signup">
            <button className="cta-button">Get Started Free</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
