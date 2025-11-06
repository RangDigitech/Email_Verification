// BlogPost.jsx (dynamic single)
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./BlogPost1.css";
import { getPublicBlogPostBySlug } from "./api";

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    getPublicBlogPostBySlug(slug)
      .then(setPost)
      .catch((e) => console.error("Failed to fetch blog post", e));
  }, [slug]);

  if (!post) return null;

  return (
    <div className="blog-post-page">
      <div className="blog-post-hero">
        <h1 className="blog-post-main-title">{post.title}</h1>
        <div className="blog-post-meta">
          <span className="blog-post-author">By {post.author_name}</span>
          <span className="meta-separator">•</span>
          <span className="blog-post-date">
            {post.published_at ? new Date(post.published_at).toLocaleDateString() : ""}
          </span>
          <span className="meta-separator">•</span>
          <span className="blog-post-read-time">{post.readTime || "4 min read"}</span>
        </div>
      </div>

      <div className="blog-post-container">
        <div className="blog-post-top-nav">
          <Link to="/blogs" className="back-to-blogs-top-btn">
            ← Back to Blogs
          </Link>
        </div>

        {post.cover_image_url && (
          <div className="blog-post-featured-image">
            <img src={post.cover_image_url} alt={post.title} />
          </div>
        )}

        <article className="blog-post-content">
          {/* Server already provides sanitized HTML from Markdown (supports **bold**) */}
          <div dangerouslySetInnerHTML={{ __html: post.content_html }} />
        </article>

        <div className="blog-post-footer">
          <Link to="/blogs" className="back-to-blogs-btn">
            ← Back to All Blogs
          </Link>
        </div>
      </div>
    </div>
  );
}
