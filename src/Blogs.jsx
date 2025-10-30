import React from "react";
import { Link } from "react-router-dom";
import "./Blogs.css";

const blogPosts = [
  {
    id: 1,
    title: "Building Real-World AI Applications with Gemini and Imagen",
    excerpt: "Explore Google Cloud’s Vertex AI and the powerful models it offers.Embrace the future of technology, and let your creativity flourish with the power of AI!",
    date: "June 10, 2025",
    author: "Zeel Patel",
    category: "Best Practices",
    readTime: "5 min read",
    image: "/document.png",
    slug: "why-email-verification-matters"
  },
//   {
//     id: 2,
//     title: "Understanding Email Bounce Rates: Hard vs Soft Bounces",
//     excerpt: "Learn the difference between hard and soft bounces, what causes them, and how to reduce bounce rates for better email campaign performance.",
//     date: "March 10, 2024",
//     author: "Michael Chen",
//     category: "Technical Guide",
//     readTime: "7 min read",
//     image: "/reliability.png"
//   },
//   {
//     id: 3,
//     title: "10 Tips to Maintain a Clean Email List",
//     excerpt: "Keep your email list healthy and engaged with these proven strategies for list maintenance and subscriber management.",
//     date: "March 5, 2024",
//     author: "Emily Rodriguez",
//     category: "Best Practices",
//     readTime: "6 min read",
//     image: "/secure-data.png"
//   },
//   {
//     id: 4,
//     title: "How AI is Revolutionizing Email Verification",
//     excerpt: "Explore how artificial intelligence and machine learning are transforming email verification technology for better accuracy and speed.",
//     date: "February 28, 2024",
//     author: "David Park",
//     category: "Technology",
//     readTime: "8 min read",
//     image: "/wallet.png"
//   },
//   {
//     id: 5,
//     title: "GDPR Compliance and Email Verification",
//     excerpt: "Everything you need to know about staying GDPR compliant while verifying and managing your email lists in 2024.",
//     date: "February 20, 2024",
//     author: "Anna Schmidt",
//     category: "Compliance",
//     readTime: "10 min read",
//     image: "/secure-data.png"
//   },
//   {
//     id: 6,
//     title: "Integrating Email Verification into Your Signup Flow",
//     excerpt: "A step-by-step guide to implementing real-time email verification in your website's registration process for better user quality.",
//     date: "February 15, 2024",
//     author: "James Wilson",
//     category: "Development",
//     readTime: "12 min read",
//     image: "/reliability.png"
//   }
];

export default function Blogs() {
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
          {blogPosts.map((post) => (
            <Link key={post.id} to={`/blogs/${post.slug}`} className="blog-card-link">
              <article className="blog-card">
                <div className="blog-image">
                  <img src={post.image} alt={post.title} />
                  <span className="blog-category">{post.category}</span>
                </div>
                
                <div className="blog-content">
                  <div className="blog-meta">
                    <span className="blog-date">{post.date}</span>
                    <span className="blog-separator">•</span>
                    <span className="blog-read-time">{post.readTime}</span>
                  </div>
                  
                  <h2 className="blog-title">{post.title}</h2>
                  <p className="blog-excerpt">{post.excerpt}</p>
                  
                  <div className="blog-footer">
                    <span className="blog-author">By {post.author}</span>
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

