import React, { useState, useEffect } from "react";
import "./BulkVerifier.css";
import { validateBulk, apiUrl } from "./api";

export default function BulkVerifier({ setShowSidebar, resetTrigger, panel = "overview" }) {
  const [view, setView] = useState("list");
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validations, setValidations] = useState([]);
  const [currentResult, setCurrentResult] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [emailCount, setEmailCount] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("bulkValidations");
    if (saved) {
      try {
        const parsedValidations = JSON.parse(saved);
        setValidations(parsedValidations);
        if (parsedValidations.length === 0) setView("upload");
      } catch (e) {
        localStorage.removeItem("bulkValidations");
      }
    } else {
      setView("upload");
    }
  }, []);

  useEffect(() => {
    if (resetTrigger > 0 && validations.length > 0) {
      setView("list");
      setCurrentResult(null);
    }
  }, [resetTrigger, validations.length]);

  useEffect(() => {
    setShowSidebar(view === "results");
  }, [view, setShowSidebar]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files && e.target.files[0];
    if (selectedFile && (selectedFile.type === "text/csv" || selectedFile.name.endsWith(".csv"))) {
      setFile(selectedFile);
      countEmailsInCSV(selectedFile);
    } else {
      alert("Please upload a valid CSV file");
    }
  };

  const countEmailsInCSV = (csvFile) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n').filter(line => line.trim());
      setEmailCount(Math.max(0, lines.length - 1));
    };
    reader.readAsText(csvFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files && e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === "text/csv" || droppedFile.name.endsWith(".csv"))) {
      setFile(droppedFile);
      countEmailsInCSV(droppedFile);
    } else {
      alert("Please upload a valid CSV file");
    }
  };

  const handleValidate = async () => {
    if (!file) return alert("Please choose a CSV file first");
    
    setView("uploading");
    setUploadProgress(0);

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + Math.random() * 15;
      });
    }, 300);

    try {
      const data = await validateBulk({ file });
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        const updatedValidations = [data, ...validations];
        setValidations(updatedValidations);
        localStorage.setItem("bulkValidations", JSON.stringify(updatedValidations));
        setCurrentResult(data);
        setView("completed");
        setFile(null);
        setUploadProgress(0);
        setEmailCount(0);
      }, 800);
    } catch (err) {
      clearInterval(progressInterval);
      console.error(err);
      alert(err.message || "Bulk verification failed. Please try again.");
      setView("upload");
      setCurrentResult(null);
      setUploadProgress(0);
    }
  };

  const handleBackToList = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setView("list");
    setCurrentResult(null);
  };

  const handleViewResult = (result) => {
    setCurrentResult(result);
    setView("results");
  };

  const handleViewResults = () => setView("results");
  const handleNewList = () => {
    setView("upload");
    setFile(null);
    setEmailCount(0);
  };

  const filteredValidations = validations.filter(
    (v) =>
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.fileName && v.fileName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="bulk-verifier">
      {view === "upload" && (
        <UploadView
          file={file}
          isDragging={isDragging}
          handleFileChange={handleFileChange}
          handleDragOver={handleDragOver}
          handleDragLeave={handleDragLeave}
          handleDrop={handleDrop}
          handleValidate={handleValidate}
          onBackToList={validations.length > 0 ? handleBackToList : null}
        />
      )}

      {view === "uploading" && (
        <UploadingView 
          fileName={file?.name || "File"} 
          progress={uploadProgress}
          emailCount={emailCount}
        />
      )}

      {view === "completed" && currentResult && (
        <CompletionView result={currentResult} onViewResults={handleViewResults} onBackToList={handleBackToList} />
      )}

      {view === "list" && (
        <ListView
          validations={filteredValidations}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onViewResult={handleViewResult}
          onNewList={handleNewList}
        />
      )}

      {view === "results" && currentResult && (
        <ResultsView results={currentResult} onBack={handleBackToList} panel={panel} setValidations={setValidations} validations={validations} setCurrentResult={setCurrentResult} />
      )}
    </div>
  );
}

// Upload View Component
function UploadView({
  file,
  isDragging,
  handleFileChange,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleValidate,
  onBackToList,
}) {
  const handleBackClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onBackToList) onBackToList(e);
  };

  return (
    <div className="upload-section">
      {onBackToList && (
        <button className="back-link" onClick={handleBackClick} type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Lists
        </button>
      )}

      <div className="upload-card">
        <div className="upload-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <h2>Import a list to verify</h2>
        <p>Upload a CSV file to start verifying your email addresses</p>

        <div
          className={`file-drop-zone ${isDragging ? "dragging" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input type="file" accept=".csv" onChange={handleFileChange} id="file-upload" className="file-input" />
          <label htmlFor="file-upload" className="file-label">
            {file ? (
              <div className="file-selected">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                  <polyline points="13 2 13 9 20 9" />
                </svg>
                <span className="file-name">{file.name}</span>
              </div>
            ) : (
              <>
                <span className="upload-text">Drop your CSV file here or click to browse</span>
                <span className="upload-subtext">Supports .csv files only</span>
              </>
            )}
          </label>
        </div>

        {file && (
          <button className="validate-btn" onClick={handleValidate}>
            Validate Emails
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// NEW: Uploading View Component - Small Card
function UploadingView({ fileName, progress, emailCount }) {
  const circumference = 2 * Math.PI * 85;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="uploading-section fade-in">
      <div className="uploading-card">
        <div className="uploading-header">
          <h3>{fileName.replace('.csv', '')}</h3>
          <div className="uploading-meta">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>My Computer</span>
          </div>
        </div>

        <div className="uploading-chart-wrapper">
          <svg className="uploading-donut-svg" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="85"
              fill="none"
              stroke="#F2F2F2"
              strokeWidth="18"
            />
            <circle
              cx="100"
              cy="100"
              r="85"
              fill="none"
              stroke="#7C3AED"
              strokeWidth="18"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform="rotate(-90 100 100)"
              className="uploading-progress-circle"
            />
          </svg>
          <div className="uploading-center">
            <div className="uploading-percentage">{Math.round(progress)}%</div>
            <div className="uploading-label">Uploading</div>
          </div>
        </div>

        <div className="uploading-spinner-container">
          <div className="uploading-spinner"></div>
        </div>

        <button className="verify-btn-uploading" disabled>
          View Results
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Completion View Component
function CompletionView({ result, onViewResults, onBackToList }) {
  const deliverableAngle = (result.deliverable / 100) * 360;
  const undeliverableAngle = (result.undeliverable / 100) * 360;
  const riskyAngle = (result.risky / 100) * 360;

  const gradient = `conic-gradient(
    #4CAF50 0deg ${deliverableAngle}deg,
    #FF5252 ${deliverableAngle}deg ${deliverableAngle + undeliverableAngle}deg,
    #FFC107 ${deliverableAngle + undeliverableAngle}deg ${deliverableAngle + undeliverableAngle + riskyAngle}deg,
    #F2F2F2 ${deliverableAngle + undeliverableAngle + riskyAngle}deg 360deg
  )`;

  const handleBackClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onBackToList(e);
  };

  return (
    <div className="completion-section fade-in">
      <button className="back-link" onClick={handleBackClick} type="button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to Lists
      </button>

      <div className="completion-card">
        <div className="completion-header">
          <h3>{result.name}</h3>
          <div className="completion-meta">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>{result.source}</span>
          </div>
        </div>

        <div className="completion-chart-wrapper">
          <div className="completion-donut animate-donut" style={{ background: gradient }}>
            <div className="completion-donut-hole">
              <div className="completion-percentage">{result.deliverable}%</div>
              <div className="completion-label">Deliverable</div>
            </div>
          </div>
        </div>

        <div className="completion-stats">
          <div className="stat-item">
            <div className="stat-dot deliverable"></div>
            <span className="stat-label">Deliverable</span>
            <span className="stat-value">{result.deliverable}%</span>
          </div>
          <div className="stat-item">
            <div className="stat-dot undeliverable"></div>
            <span className="stat-label">Undeliverable</span>
            <span className="stat-value">{result.undeliverable}%</span>
          </div>
          <div className="stat-item">
            <div className="stat-dot risky"></div>
            <span className="stat-label">Risky</span>
            <span className="stat-value">{result.risky}%</span>
          </div>
        </div>

        <button className="view-results-btn" onClick={onViewResults}>
          View Results
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// List View Component
function ListView({ validations, searchQuery, setSearchQuery, onViewResult, onNewList }) {
  return (
    <div className="list-section fade-in">
      <div className="list-header">
        <button className="new-list-btn" onClick={onNewList}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New List
        </button>

        <div className="search-bar">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search lists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {validations.length === 0 ? (
        <div className="no-lists">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="9" y1="9" x2="15" y2="15" />
            <line x1="15" y1="9" x2="9" y2="15" />
          </svg>
          <p>No validations found</p>
          <span>Click "New List" to create your first validation</span>
        </div>
      ) : (
        <div className="list-grid">
          {validations.map((validation) => (
            <ValidationCard key={validation.id} validation={validation} onViewResult={onViewResult} />
          ))}
        </div>
      )}
    </div>
  );
}

// Validation Card Component
function ValidationCard({ validation, onViewResult }) {
  const deliverableAngle = (validation.deliverable / 100) * 360;
  const undeliverableAngle = (validation.undeliverable / 100) * 360;
  const riskyAngle = (validation.risky / 100) * 360;

  const gradient = `conic-gradient(
    #4CAF50 0deg ${deliverableAngle}deg,
    #FF5252 ${deliverableAngle}deg ${deliverableAngle + undeliverableAngle}deg,
    #FFC107 ${deliverableAngle + undeliverableAngle}deg ${deliverableAngle + undeliverableAngle + riskyAngle}deg,
    #F2F2F2 ${deliverableAngle + undeliverableAngle + riskyAngle}deg 360deg
  )`;

  return (
    <div className="validation-card" onClick={() => onViewResult(validation)}>
      <div className="validation-card-header">
        <h3>{validation.name}</h3>
        <div className="validation-meta">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>{validation.source}</span>
        </div>
      </div>

      <div className="validation-chart-wrapper">
        <div className="validation-donut" style={{ background: gradient }}>
          <div className="validation-donut-hole">
            <div className="validation-count">{validation.totalEmails}</div>
            <div className="validation-label">Emails</div>
          </div>
        </div>
      </div>

      <div className="validation-stats">
        <div className="mini-stat">
          <div className="mini-stat-dot deliverable"></div>
          <span>{validation.deliverable}%</span>
        </div>
        <div className="mini-stat">
          <div className="mini-stat-dot undeliverable"></div>
          <span>{validation.undeliverable}%</span>
        </div>
        <div className="mini-stat">
          <div className="mini-stat-dot risky"></div>
          <span>{validation.risky}%</span>
        </div>
      </div>

      <button className="verify-btn">
        View Details
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}

// Results View Component
function ResultsView({ results, onBack, panel = "overview", setValidations, validations, setCurrentResult }) {
  const totalEmails = results.totalEmails;
  const deliverableCount = Math.round((totalEmails * results.deliverable) / 100);
  const undeliverableCount = Math.round((totalEmails * results.undeliverable) / 100);
  const riskyCount = Math.round((totalEmails * results.risky) / 100);
  const unknownCount = Math.round((totalEmails * results.unknown) / 100);

  const handleBackClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onBack(e);
  };

  return (
    <div className="results-view fade-in">
      <button className="back-link" onClick={handleBackClick} type="button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="results-header">
        <div className="stat-card">
          <div className="stat-label">Name</div>
          <div className="stat-value">{results.name}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Emails</div>
          <div className="stat-value">{totalEmails}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Uploaded</div>
          <div className="stat-value">{results.uploadDate}</div>
        </div>
      </div>

      {panel === "overview" && (
        <>
          <div className="chart-section">
            <div className="main-chart">
              <DonutChart
                deliverable={results.deliverable}
                undeliverable={results.undeliverable}
                risky={results.risky}
                unknown={results.unknown}
              />
            </div>

            <div className="chart-legend">
              <LegendItem color="#4CAF50" label="Deliverable" percentage={results.deliverable} count={deliverableCount} />
              <LegendItem color="#FF5252" label="Undeliverable" percentage={results.undeliverable} count={undeliverableCount} />
              <LegendItem color="#FFC107" label="Risky" percentage={results.risky} count={riskyCount} />
              <LegendItem color="#9E9E9E" label="Unknown" percentage={results.unknown} count={unknownCount} />
            </div>
          </div>

          <div className="breakdown-section">
            <BreakdownCard
              title="Deliverable"
              icon="✓"
              color="#4CAF50"
              percentage={results.deliverable}
              count={deliverableCount}
              items={[
                { label: "Valid", count: results.breakdown.deliverable.valid },
                { label: "Accept All", count: results.breakdown.deliverable.acceptAll },
                { label: "Disposable", count: results.breakdown.deliverable.disposable },
                { label: "Role Based", count: results.breakdown.deliverable.roleBased },
              ]}
            />

            <BreakdownCard
              title="Undeliverable"
              icon="✕"
              color="#FF5252"
              percentage={results.undeliverable}
              count={undeliverableCount}
              items={[
                { label: "Invalid Email", count: results.breakdown.undeliverable.invalidEmail },
                { label: "Invalid Domain", count: results.breakdown.undeliverable.invalidDomain },
                { label: "Rejected Email", count: results.breakdown.undeliverable.rejectedEmail },
                { label: "Invalid SMTP", count: results.breakdown.undeliverable.invalidSMTP },
              ]}
            />

            <BreakdownCard
              title="Risky"
              icon="⚠"
              color="#FFC107"
              percentage={results.risky}
              count={riskyCount}
              items={[
                { label: "Low Quality", count: results.breakdown.risky.lowQuality },
                { label: "Low Deliverability", count: results.breakdown.risky.lowDeliverability },
              ]}
            />
          </div>
        </>
      )}

      {panel === "emails" && (
        <div className="card emails-card">
          <div className="card-header">
            <h3>Emails</h3>
            <div className="chips">
              {[["ALL", null], ["DELIVERABLE", "Deliverable"], ["UNDELIVERABLE", "Undeliverable"], ["RISKY", "Risky"], ["UNKNOWN", "Unknown"]].map(([label, filter]) => (
                <button key={label} className="chip" data-filter={filter}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="table">
            <div className="thead">
              <div>Email</div>
              <div>Reason</div>
              <div>Score</div>
              <div>State</div>
            </div>
            <div className="tbody">
              {(results.resultsArray || []).map((r, i) => (
                <div className="tr" key={i}>
                  <div>{r.email}</div>
                  <div className="reason-cell">{r.reason || r.message || "-"}</div>
                  <div>{typeof r.score === 'number' ? Math.round(r.score) : (r.score ?? '-')}</div>
                  <div>{r.state}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {panel === "exports" && (
        <div className="card exports-card">
          <div className="card-header">
            <h3>Exports</h3>
            <button className="primary" onClick={async () => {
              if (results.files && results.files.results_csv) {
                const url = apiUrl(results.files.results_csv);
                window.open(url, '_blank');
                return;
              }

              const rows = results.resultsArray || [];
              if (rows.length === 0) return alert('No results to export');
              const csv = [Object.keys(rows[0]).join(','), ...rows.map(r => Object.values(r).map(v=>`"${String(v||'').replace(/"/g,'""')}"`).join(','))].join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const href = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = href;
              a.download = `${results.name || 'export'}.csv`;
              document.body.appendChild(a);
              a.click();
              a.remove();
              URL.revokeObjectURL(href);
            }}>NEW EXPORT</button>
          </div>
          <div className="empty-table">There are no exports to display.</div>
        </div>
      )}

      {panel === "settings" && (
        <div className="card settings-card">
          <h3>General</h3>
          <SettingsForm results={results} setCurrentResult={setCurrentResult} setValidations={setValidations} validations={validations} />
        </div>
      )}
    </div>
  );
}

// Helper Components
function DonutChart({ deliverable, undeliverable, risky, unknown }) {
  const deliverableAngle = (deliverable / 100) * 360;
  const undeliverableAngle = (undeliverable / 100) * 360;
  const riskyAngle = (risky / 100) * 360;
  const unknownAngle = (unknown / 100) * 360;

  const gradient = `conic-gradient(
    #4CAF50 0deg ${deliverableAngle}deg,
    #FF5252 ${deliverableAngle}deg ${deliverableAngle + undeliverableAngle}deg,
    #FFC107 ${deliverableAngle + undeliverableAngle}deg ${deliverableAngle + undeliverableAngle + riskyAngle}deg,
    #9E9E9E ${deliverableAngle + undeliverableAngle + riskyAngle}deg ${deliverableAngle + undeliverableAngle + riskyAngle + unknownAngle}deg,
    #F2F2F2 ${deliverableAngle + undeliverableAngle + riskyAngle + unknownAngle}deg 360deg
  )`;

  return (
    <div className="donut-chart">
      <div className="donut-ring" style={{ background: gradient }}>
        <div className="donut-hole">
          <div className="donut-percentage">{deliverable}%</div>
          <div className="donut-label">Deliverable</div>
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label, percentage, count }) {
  return (
    <div className="legend-item">
      <div className="legend-badge" style={{ background: color }}>
        {percentage}%
      </div>
      <div className="legend-info">
        <div className="legend-label">{label}</div>
        <div className="legend-count">{count}</div>
      </div>
    </div>
  );
}

function BreakdownCard({ title, icon, color, percentage, count, items }) {
  return (
    <div className="breakdown-card">
      <div className="breakdown-header">
        <span className="breakdown-icon">{icon}</span>
        <span className="breakdown-title">{title}</span>
      </div>

      <div className="breakdown-chart">
        <div
          className="mini-donut"
          style={{
            background: `conic-gradient(${color} 0deg ${(percentage / 100) * 360}deg, #F2F2F2 ${(percentage / 100) * 360}deg 360deg)`,
          }}
        >
          <div className="mini-donut-hole">
            <div className="mini-percentage">{percentage}%</div>
            <div className="mini-count">{count}</div>
          </div>
        </div>
      </div>

      <div className="breakdown-items">
        {items.map((item, index) => (
          <div key={index} className="breakdown-item">
            <div className="breakdown-item-badge" style={{ background: color }}>
              {count > 0 && item.count > 0 ? `${Math.round((item.count / count) * 100)}%` : "0%"}
            </div>
            <div className="breakdown-item-label">{item.label}</div>
            <div className="breakdown-item-count">{item.count}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsForm({ results, setCurrentResult, setValidations, validations }) {
  const [name, setName] = useState(results.name || "");

  const handleSave = () => {
    const updated = { ...results, name };
    setCurrentResult(updated);
    const updatedValidations = validations.map(v => (v.id === updated.id ? updated : v));
    setValidations(updatedValidations);
    localStorage.setItem("bulkValidations", JSON.stringify(updatedValidations));
    alert('Name updated');
  };

  const handleDelete = () => {
    if (!confirm('Delete this validation from local history?')) return;
    const remaining = validations.filter(v => v.id !== results.id);
    setValidations(remaining);
    localStorage.setItem("bulkValidations", JSON.stringify(remaining));
    setCurrentResult(null);
    alert('Deleted');
  };

  return (
    <>
      <label className="field">
        <span>Name</span>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <div className="actions">
        <button className="danger" onClick={handleDelete}>DELETE</button>
        <button className="primary" onClick={handleSave}>SAVE</button>
      </div>
    </>
  );
}