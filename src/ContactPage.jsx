import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ContactPage.css";
import "./Dashboard.css";
import ReCAPTCHA from "react-google-recaptcha";
import { RECAPTCHA_SITE_KEY } from "./api";

export default function ContactPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { from, requestedCredits, isLoggedIn } = location.state || {};

  // Backend URL from env (falls back to localhost)
  const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject:
      from === "buyCredits"
        ? `Enterprise Pricing Request - ${requestedCredits?.toLocaleString() || "Custom"} Credits`
        : "",
    message:
      from === "buyCredits"
        ? `I'm interested in purchasing ${requestedCredits?.toLocaleString() || "custom amount of"} credits for enterprise use. Please contact me with pricing details.`
        : "",
  });

  const [captchaToken, setCaptchaToken] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ref for auto-expanding textarea
  const textareaRef = useRef(null);

  // Ref for file input
  const fileInputRef = useRef(null);

  // File validation constants
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const MAX_FILES = 3;
  const ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
  ];

  // Auto-expand textarea based on content
  const autoExpandTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const newHeight = Math.min(textareaRef.current.scrollHeight, 300);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "message") {
      setTimeout(autoExpandTextarea, 0);
    }
  };

  useEffect(() => {
    autoExpandTextarea();
  }, [form.message]);

  // File handling
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) {
      return;
    }

    if (attachments.length + files.length > MAX_FILES) {
      alert(`You can only attach up to ${MAX_FILES} files.`);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        alert(`File "${file.name}" has an unsupported type.`);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
    }

    setAttachments([...attachments, ...files]);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validate captcha
      if (!captchaToken) {
        alert("Please complete the captcha.");
        return;
      }

      setIsSubmitting(true);

      // Create FormData for multipart/form-data submission
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('email', form.email);
      formData.append('phone', form.phone || '');
      formData.append('subject', form.subject);
      formData.append('message', form.message);
      formData.append('recaptcha_token', captchaToken);

      // Append each file individually with the field name 'attachments'
      // This creates: attachments=file1, attachments=file2, etc.
      attachments.forEach((file) => {
        formData.append('attachments', file, file.name);
      });

      // DEBUG: Log what we're sending
      console.log('📤 Sending form data to:', `${API_URL}/api/contact`);
      console.log('📎 Attachments count:', attachments.length);
      console.log('📄 Files:', attachments.map(f => ({ name: f.name, size: f.size, type: f.type })));

      // Log FormData contents (for debugging)
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }

      // POST to backend with FormData
      const response = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        body: formData,
        // Don't set Content-Type header - browser will set it with boundary for multipart
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Success:', data);
        alert("✅ Message sent successfully! We will contact you soon.");

        // Reset form
        setForm({ name: "", email: "", phone: "", subject: "", message: "" });
        setCaptchaToken("");
        setAttachments([]);

        // Navigate back to dashboard if coming from buyCredits and logged in
        if (isLoggedIn && from === "buyCredits") {
          setTimeout(() => navigate("/dashboard"), 1000);
        }
      } else {
        console.error('❌ Error response:', data);
        alert("❌ Failed to send message: " + (data.detail || data.error || "Unknown error"));
      }
    } catch (err) {
      console.error('❌ Error:', err);
      alert("⚠️ Something went wrong. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const userEmail = localStorage.getItem("userEmail") || "user@example.com";
  const userInitial = userEmail.charAt(0).toUpperCase();
  const credits = Number(localStorage.getItem("credits") || 0);
  const displayName = localStorage.getItem("name") || null;

  return (
    <div
      className="contact-page"
      style={isLoggedIn ? { background: "#f5f5f5", minHeight: "100vh" } : {}}
    >
      {/* Dashboard Header (only shows when logged in) */}
      {isLoggedIn && (
        <header
          className="dashboard-header"
          style={{ background: "#000", position: "sticky", top: 0, zIndex: 100 }}
        >
          <div className="header-left">
            <div
              className="dashboard-logo"
              onClick={() => navigate("/dashboard")}
              style={{ cursor: "pointer" }}
            >
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <rect
                  x="30"
                  y="60"
                  width="140"
                  height="100"
                  fill="#fffdfdff"
                  rx="8"
                />
                <path
                  d="M 30 60 L 100 110 L 170 60"
                  stroke="#000000ff"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="150" cy="50" r="25" fill="#5d1590ff" />
                <path
                  d="M 140 50 L 147 57 L 160 44"
                  stroke="#ffffff"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="logo-text">AI Email Verifier</span>
            </div>

            <div
              style={{
                marginLeft: "40px",
                color: "#fff",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              {from === "buyCredits" && "/ Enterprise Pricing Request"}
            </div>
          </div>

          <div className="dashboard-actions">
            <div className="user-toggle relative">
              <div
                className="user-toggle-btn flex items-center gap-2"
                style={{ cursor: "pointer" }}
              >
                <div
                  className="user-avatar bg-[#000000] text-white"
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "#7c4dff",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "700",
                    fontSize: "14px",
                  }}
                >
                  {userInitial}
                </div>
                <div style={{ color: "#fff", fontSize: "14px" }}>
                  <div style={{ fontWeight: "600" }}>
                    {displayName || userEmail}
                  </div>
                  <div style={{ fontSize: "11px", opacity: 0.7 }}>
                    Credits: {credits}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      <section
        className="contact-section"
        style={isLoggedIn ? { paddingTop: "40px" } : {}}
      >
        <div className="container contact-container">
          {/* Left Side */}
          <div className="contact-left">
            <h2>Get in Touch</h2>
            <p>
              We're AI Email Verifier your trusted partner for accurate email
              validation. Whether you're a developer, marketer, or business
              owner, we'd love to hear from you. Have questions, feedback, or
              partnership ideas? Drop us a message!
            </p>
          </div>

          {/* Right Side */}
          <div className="contact-right">
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label>Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Message *</label>

                {/* Message wrapper with + button INSIDE (bottom right) */}
                <div className="message-wrapper">
                  {/* Auto-expanding textarea */}
                  <textarea
                    ref={textareaRef}
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    className="auto-expand-textarea"
                    placeholder="Type your message here..."
                  ></textarea>

                  {/* Plus icon button - INSIDE the box (bottom right) */}
                  <button
                    type="button"
                    className="attachment-btn-inside"
                    title="Attach files"
                    disabled={isSubmitting || attachments.length >= MAX_FILES}
                    onClick={() => {
                      console.log('🖱️ + Button clicked!');
                      fileInputRef.current?.click();
                    }}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </button>

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="attachment-input"
                    multiple
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.xls,.xlsx,.csv"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                </div>

                {/* Attachment preview list */}
                {attachments.length > 0 && (
                  <div className="attachment-list">
                    {attachments.map((file, index) => (
                      <div key={index} className="attachment-item">
                        <span className="attachment-name" title={file.name}>
                          📎 {file.name} ({formatFileSize(file.size)})
                        </span>
                        <button
                          type="button"
                          className="remove-attachment"
                          onClick={() => removeFile(index)}
                          title="Remove"
                          disabled={isSubmitting}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* reCAPTCHA */}
              <div style={{ margin: "10px 0" }}>
                <ReCAPTCHA
                  sitekey={RECAPTCHA_SITE_KEY}
                  onChange={setCaptchaToken}
                />
              </div>

              <button
                type="submit"
                className="send-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}