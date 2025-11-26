// BulkVerifier.jsx - REPLACE THE IMPORTS AT THE TOP
import React, { useState, useEffect, useRef } from "react";
import "./BulkVerifier.css";

// ✅ FIXED IMPORTS - Import the 3 functions your component needs
import {
  apiUrl,
  enqueueBulk,          // ← Added for uploading
  getBulkStatus,        // ← Already there
  fetchBulkResultsJSON  // ← Already there
} from "./api";


import InsufficientCreditsModal from "./components/InsufficientCreditsModal";
import Toast from "./components/Toast";
import { useCredits } from "./CreditsContext";

const SUPPORTED_EXTENSIONS = [
  ".csv",
  ".tsv",
  ".txt",
  ".log",
  ".dat",
  ".xlsx",
  ".xlsm",
  ".xltx",
  ".xltm",
  ".xls",
];

const TEXT_BASED_EXTENSIONS = [".csv", ".tsv", ".txt", ".log", ".dat"];
const ACCEPT_ATTR = SUPPORTED_EXTENSIONS.join(",");

const isSupportedFile = (fileName = "") => {
  const lower = fileName.toLowerCase();
  return SUPPORTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
};

const isTextBasedFile = (fileName = "") => {
  const lower = fileName.toLowerCase();
  return TEXT_BASED_EXTENSIONS.some((ext) => lower.endsWith(ext));
};

const anonymousHistoryKey = "bulkValidations:anonymous";
const getUserHistoryKey = () => {
  const email =
    localStorage.getItem("userEmail") ||
    localStorage.getItem("name_email") ||
    "";
  return email ? `bulkValidations:${email.toLowerCase()}` : anonymousHistoryKey;
};


export default function BulkVerifier({ setShowSidebar, resetTrigger, panel = "overview" }) {
  const [view, setView] = useState("list");
  const [file, setFile] = useState(null);
  const [fileHash, setFileHash] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validations, setValidations] = useState([]);
  const [currentResult, setCurrentResult] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [emailCount, setEmailCount] = useState(0);
  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);
  // `refreshCredits` comes from `CreditsContext` and re-fetches `/me/credits`
  // so that the header balance and localStorage stay in sync with the backend.
  const {
    refreshCredits,
    credits: creditsState,
  } = useCredits?.() ?? { refreshCredits: () => { }, credits: null };
  const [historyKey] = useState(() => getUserHistoryKey());
  const [job, setJob] = useState(null);
  const [progress, setProgress] = useState(null);
  const pollRef = useRef(null);
  const [insufficientDetails, setInsufficientDetails] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });

  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
  };

  // Normalize row objects coming from results.json
  const normalizeRows = (raw = []) => {
    const norm = (Array.isArray(raw) ? raw : []).map((r) => {
      const email = r.email || r.address || r.mail || r.user_email || r.to || "";
      const stateRaw = r.state || r.status || r.result || r.verdict || r.outcome || "";
      const state = typeof stateRaw === "string"
        ? stateRaw.charAt(0).toUpperCase() + stateRaw.slice(1).toLowerCase()
        : "";
      const reason = r.reason || r.message || r.detail || r.error || r.cause || "";
      let score = r.score;
      if (typeof score === "number" && score <= 1) score = Math.round(score * 100);
      if (score == null && typeof r.confidence === "number") score = Math.round(r.confidence * 100);
      if (score == null && typeof r.risk === "number") score = Math.round(100 - r.risk * 100);
      return {
        email,
        state: state || (r.deliverable === true ? "Deliverable" : r.risky === true ? "Risky" : r.undeliverable === true ? "Undeliverable" : r.unknown === true ? "Unknown" : ""),
        score,
        reason,
        accept_all: r.accept_all ?? r.acceptAll ?? false,
        disposable: r.disposable ?? false,
        role: r.role ?? false,
      };
    });

    const total = norm.length;
    const pct = (n) => Math.round((n / Math.max(1, total)) * 100);
    const deliverable = pct(norm.filter((r) => r.state === "Deliverable").length);
    const undeliverable = pct(norm.filter((r) => r.state === "Undeliverable").length);
    const risky = pct(norm.filter((r) => r.state === "Risky").length);
    const unknown = pct(norm.filter((r) => r.state === "Unknown").length);

    const breakdown = (() => {
      const b = {
        deliverable: { valid: 0, acceptAll: 0, disposable: 0, roleBased: 0 },
        undeliverable: { invalidEmail: 0, invalidDomain: 0, rejectedEmail: 0, invalidSMTP: 0 },
        risky: { lowQuality: 0, lowDeliverability: 0 },
        unknown: { noConnect: 0, timeout: 0, unavailableSMTP: 0, unexpectedError: 0 },
      };
      norm.forEach((r) => {
        if (r.state === "Deliverable") {
          b.deliverable.valid++;
          if (r.accept_all) b.deliverable.acceptAll++;
          if (r.disposable) b.deliverable.disposable++;
          if (r.role) b.deliverable.roleBased++;
        } else if (r.state === "Undeliverable") {
          if (r.reason === "REJECTED EMAIL") b.undeliverable.rejectedEmail++;
          else if (r.reason === "Invalid format") b.undeliverable.invalidEmail++;
          else b.undeliverable.invalidDomain++;
        } else if (r.state === "Risky") {
          if (typeof r.score === "number" && r.score < 60) b.risky.lowQuality++;
          else b.risky.lowDeliverability++;
        }
      });
      return b;
    })();

    return { norm, total, deliverable, undeliverable, risky, unknown, breakdown };
  };

  const loadAndShowResults = async () => {
    try {
      // Try multiple sources for files: progress state, job state, or re-fetch from API
      let files = progress?.files || null;
      const currentJobId = job?.jobid;

      // DEBUG: Log what we have
      console.debug("[Bulk] loadAndShowResults", {
        hasProgressFiles: !!progress?.files,
        hasJobId: !!currentJobId,
        progressFiles: progress?.files,
        job: job
      });

      // If files are missing, try to fetch latest status from backend
      if (!files?.results_json && currentJobId) {
        console.warn("[Bulk] No results_json in progress state, fetching latest status from backend");
        try {
          const latestStatus = await getBulkStatus(currentJobId);
          console.debug("[Bulk] Latest status from backend", latestStatus);
          files = latestStatus.files;
          // Update progress state with latest files
          if (files) {
            setProgress(prev => ({ ...prev, files }));
          }
        } catch (fetchError) {
          console.error("[Bulk] Failed to fetch latest status", fetchError);
        }
      }

      if (!files?.results_json) {
        console.error("[Bulk] No results_json provided in files after all attempts", {
          files,
          progress,
          job,
          suggestion: "Check backend /bulk/status/{jobid} endpoint - it should return files.results_json when job is finished"
        });
        alert("Results are not ready yet. The JSON file link has not been provided by the backend. Please check the backend logs to ensure the Redis queue is properly returning the download link in the status response.");
        return;
      }

      console.debug("[Bulk] Fetching results JSON from", files.results_json);
      const rows = await fetchBulkResultsJSON(files);
      const { norm, total, deliverable, undeliverable, risky, unknown, breakdown } = normalizeRows(rows);
      const resultObj = {
        id: currentJobId || Date.now(),
        name: (file?.name || "list").replace(/\.csv$/i, ""),
        source: "My Computer",
        totalEmails: total,
        uploadDate: new Date().toLocaleDateString(),
        deliverable,
        undeliverable,
        risky,
        unknown,
        duplicate: 0,
        files,
        resultsArray: norm,
        breakdown,
      };
      setCurrentResult(resultObj);
      setView("results");

      // Update the corresponding stub in the list with final stats
      setValidations((prev) => {
        const next = prev.map((v) => (v.id === (currentJobId || v.id)
          ? { ...v, ...resultObj }
          : v));
        localStorage.setItem(historyKey, JSON.stringify(next));
        return next;
      });
    } catch (e) {
      console.error("[Bulk] loadAndShowResults failed", e);
      alert(`Failed to load results: ${e.message}. Please check the browser console for details.`);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem(historyKey);
    if (saved) {
      try {
        const parsedValidations = JSON.parse(saved);
        setValidations(parsedValidations);
        if (parsedValidations.length === 0) setView("upload");
      } catch (e) {
        localStorage.removeItem(historyKey);
      }
    } else {
      setView("upload");
    }
  }, [historyKey]);

  useEffect(() => {
    if (resetTrigger > 0 && validations.length > 0) {
      setView("list");
      setCurrentResult(null);
    }
  }, [resetTrigger, validations.length]);

  useEffect(() => {
    setShowSidebar(view === "results");
  }, [view, setShowSidebar]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);
  const computeFileHash = async (inputFile) => {
    if (!inputFile || !window.crypto?.subtle || typeof inputFile.arrayBuffer !== "function") {
      setFileHash(null);
      return null;
    }
    try {
      const buffer = await inputFile.arrayBuffer();
      const hashBuffer = await window.crypto.subtle.digest("SHA-256", buffer);
      const byteArray = Array.from(new Uint8Array(hashBuffer));
      const hex = byteArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      const base64 = btoa(String.fromCharCode(...byteArray));
      const hashData = { hex, base64 };
      setFileHash(hashData);
      return hashData;
    } catch (hashError) {
      console.warn("[Bulk] Failed to hash file", hashError);
      setFileHash(null);
      return null;
    }
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files && e.target.files[0];
    if (selectedFile && isSupportedFile(selectedFile.name)) {
      setFile(selectedFile);
      estimateEmailCount(selectedFile);
      await computeFileHash(selectedFile);
    } else {
      alert("Please upload a supported file (.csv, .tsv, .txt, .log, .dat, .xlsx, .xlsm, .xltx, .xltm, .xls)");
    }
  };

  const estimateEmailCount = (inputFile) => {
    if (!inputFile || !isTextBasedFile(inputFile.name)) {
      setEmailCount(0);
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split("\n").filter((line) => line.trim());
      setEmailCount(Math.max(0, lines.length - 1));
    };
    reader.onerror = () => setEmailCount(0);
    reader.readAsText(inputFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files && e.dataTransfer.files[0];
    if (droppedFile && isSupportedFile(droppedFile.name)) {
      setFile(droppedFile);
      estimateEmailCount(droppedFile);
      await computeFileHash(droppedFile);
    } else {
      alert("Please upload a supported file (.csv, .tsv, .txt, .log, .dat, .xlsx, .xlsm, .xltx, .xltm, .xls)");
    }
  };

  const startPolling = (jobid) => {
    if (pollRef.current) clearInterval(pollRef.current);

    pollRef.current = setInterval(async () => {
      try {
        // 1) Fetch job status
        const data = await getBulkStatus(jobid);
        const { status, total, done, chunks, files } = data;

        // ---------------------------
        // LIVE PROGRESS UPDATE
        // ---------------------------
        if (total > 0) {
          const pct = Math.floor((done / total) * 100);
          setUploadProgress(Math.max(0, Math.min(100, pct)));
        }

        // ---------------------------
        // LIVE CHUNK RESULTS STREAMING
        // ---------------------------
        if (jobid && data.chunks > 0) {
          const chunkUrl = `/download/${jobid}/chunk_${done}.json`;

          // Try reading the most recent chunk file (if exists)
          try {
            const res = await fetch(apiUrl(chunkUrl));
            if (res.ok) {
              const rows = await res.json();

              setCurrentResult((prev) => {
                if (!prev) return prev;
                const existing = prev.resultsArray || [];
                const merged = [...existing, ...rows];

                return {
                  ...prev,
                  resultsArray: merged,
                  totalEmails: total,
                };
              });
            }
          } catch (_) {
            // chunk may not exist yet - this is fine
          }
        }

        // ---------------------------
        // NORMALIZE FILE PATHS
        // ---------------------------
        let normalizedFiles = null;
        if (files) {
          normalizedFiles = { ...files };

          if (normalizedFiles.results_json) {
            normalizedFiles.results_json = String(normalizedFiles.results_json)
              .replace(/\\/g, "/")
              .trim();

            if (
              !/^https?:\/\//i.test(normalizedFiles.results_json) &&
              !normalizedFiles.results_json.startsWith("/")
            ) {
              normalizedFiles.results_json = `/${normalizedFiles.results_json}`;
            }
          }

          if (normalizedFiles.results_csv) {
            normalizedFiles.results_csv = String(normalizedFiles.results_csv)
              .replace(/\\/g, "/")
              .trim();

            if (
              !/^https?:\/\//i.test(normalizedFiles.results_csv) &&
              !normalizedFiles.results_csv.startsWith("/")
            ) {
              normalizedFiles.results_csv = `/${normalizedFiles.results_csv}`;
            }
          }
        }

        // ---------------------------
        // UPDATE PROGRESS OBJECT
        // ---------------------------
        const nextProgress = {
          status,
          total,
          done,
          chunk_count: chunks,
          files: normalizedFiles || null,
          duplicates: data.duplicates,
          new_emails: data.new_emails,
          refunded_credits: data.refunded_credits,
          refund_success: data.refund_success,
        };

        setProgress(nextProgress);

        // ---------------------------
        // KEEP LIST ITEMS IN SYNC
        // ---------------------------
        setValidations((prev) => {
          const next = prev.map((v) =>
            v.id === jobid
              ? {
                ...v,
                status,
                done,
                totalEmails: v.totalEmails || total,
                files: normalizedFiles || v.files,
              }
              : v
          );
          localStorage.setItem("bulkValidations", JSON.stringify(next));
          return next;
        });

        // ---------------------------
        // JOB FINISHED
        // ---------------------------
        if (status === "finished" || (total > 0 && done >= total)) {
          clearInterval(pollRef.current);
          pollRef.current = null;
          setUploadProgress(100);

          // Auto-refresh credits
          try {
            if (typeof refreshCredits === "function") {
              Promise.resolve(refreshCredits()).catch(() => { });
            }
          } catch { }

          return;
        }
      } catch (e) {
        console.error("polling failed", e);
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }, 2000);
  };


  const handleValidate = async () => {
    if (!file) return alert("Please choose a CSV file first");

    const getAvailableCredits = () => {
      if (creditsState && typeof creditsState.remaining_credits === "number") {
        return creditsState.remaining_credits;
      }
      const stored = Number(localStorage.getItem("credits") || 0);
      return Number.isFinite(stored) ? stored : 0;
    };

    const openInsufficientModal = (needed = null, availableOverride = null) => {
      const available =
        typeof availableOverride === "number"
          ? availableOverride
          : getAvailableCredits();
      setInsufficientDetails(
        typeof needed === "number" || typeof available === "number"
          ? {
            needed: typeof needed === "number" ? needed : null,
            available: typeof available === "number" ? available : null,
          }
          : null
      );
      setShowInsufficientCreditsModal(true);
    };

    const estimatedNeeded = emailCount > 0 ? emailCount : null;
    const availableCredits = getAvailableCredits();
    if (availableCredits <= 0) {
      openInsufficientModal(estimatedNeeded, availableCredits);
      return;
    }
    if (
      estimatedNeeded !== null &&
      Number.isFinite(estimatedNeeded) &&
      availableCredits < estimatedNeeded
    ) {
      openInsufficientModal(estimatedNeeded, availableCredits);
      return;
    }

    // show the Uploading card immediately
    setView("uploading");
    setUploadProgress(5); // small initial tick so users see motion

    try {
      // enqueue → { jobid, chunks, status }
      // IMPORTANT: your enqueue helper signature is (file, smtp, workers)
      try {
        // eslint-disable-next-line no-console
        console.debug("[Bulk] handleValidate", { file, emailCount });
      } catch { }
      const hashToSend = fileHash || (await computeFileHash(file));
      const info = await enqueueBulk(file, true, 12, {
        fileHash: hashToSend?.hex,
        fileHashHex: hashToSend?.hex,
        fileHashBase64: hashToSend?.base64,
        dedupe: true,
      });
      try {
        // eslint-disable-next-line no-console
        console.debug("[Bulk] enqueueBulk info", info);
      } catch { }

      setJob(info); // {jobid, chunks, status}
      setProgress({
        status: info?.status || "queued",
        done: 0,
        total: 0,
        chunk_count: Number(info?.chunks || 0),
      });

      // begin polling for progress & completion
      startPolling(info.jobid);
      try {
        // eslint-disable-next-line no-console
        console.debug("[Bulk] started polling", { jobid: info?.jobid });
      } catch { }

      // Create a local stub so the list shows correct totals right away 
      const stub = {
        id: info.jobid,
        name: (file?.name || "list").replace(/\.csv$/i, ""),
        source: "My Computer",
        totalEmails: emailCount,
        deliverable: 0,
        undeliverable: 0,
        risky: 0,
        unknown: 0,
        status: "queued",
        createdAt: new Date().toISOString(),
        duplicates: info.duplicates_detected || 0,
        new_emails: info.total_emails - (info.duplicates_detected || 0),
      };
      setValidations(prev => {
        const next = [stub, ...prev];
        localStorage.setItem(historyKey, JSON.stringify(next));
        return next;
      });
      setCurrentResult(stub);

      // Show immediate feedback about duplicates
      if (info.duplicates_detected > 0) {
        showToast(`Found ${info.duplicates_detected} duplicates. Charged ${info.credits_charged} credits.`, "info");
      }

    } catch (err) {
      console.error(err);
      const detail = err?.meta?.detail || err?.response?.data?.detail || null;
      const message = String(
        detail?.message || err?.message || ""
      ).toLowerCase();
      const isInsufficient =
        detail?.error === "INSUFFICIENT_CREDITS" ||
        message.includes("insufficient") ||
        message.includes("not enough credits") ||
        message.includes("no credits");

      if (isInsufficient) {
        const neededFromError =
          typeof detail?.credits_needed === "number"
            ? detail.credits_needed
            : typeof err?.creditsNeeded === "number"
              ? err.creditsNeeded
              : estimatedNeeded;
        const availableFromError =
          typeof detail?.credits_available === "number"
            ? detail.credits_available
            : typeof err?.creditsAvailable === "number"
              ? err.creditsAvailable
              : availableCredits;
        openInsufficientModal(neededFromError, availableFromError);
      } else {
        const printableMessage =
          detail?.message || err?.message || "Bulk enqueue failed";
        alert(typeof printableMessage === "string"
          ? printableMessage
          : JSON.stringify(printableMessage));
      }
      setView("upload");
    }
  };

  const handleViewResult = async (result) => {
    // If the list item has file links but no rows loaded yet, fetch them
    try {
      if (result?.files?.results_json && (!result.resultsArray || result.resultsArray.length === 0)) {
        const rows = await fetchBulkResultsJSON(result.files);
        const { norm, total, deliverable, undeliverable, risky, unknown, breakdown } = normalizeRows(rows);
        result = {
          ...result,
          totalEmails: total,
          deliverable,
          undeliverable,
          risky,
          unknown,
          resultsArray: norm,
          breakdown,
        };
      }
    } catch (e) {
      console.error("[Bulk] handleViewResult enrichment failed", e);
    }
    setCurrentResult(result);
    setView("results");
  };

  const handleViewResults = () => setView("results");

  const handleBackToList = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setView("list");
    setCurrentResult(null);
  };

  const handleNewList = () => {
    setView("upload");
    setFile(null);
    setFileHash(null);
    setEmailCount(0);
  };

  const handleBuyCredits = () => {
    console.log("handleBuyCredits called in BulkVerifier");
    console.log("window.openBuyCreditsModal exists:", !!window.openBuyCreditsModal);

    // First open the buy credits modal, then close this one
    if (window.openBuyCreditsModal) {
      window.openBuyCreditsModal();
    } else {
      // Fallback: dispatch event that Dashboard can listen to
      console.log("Using event fallback");
      window.dispatchEvent(new CustomEvent("openBuyCreditsModal"));
    }

    // Close the insufficient credits modal with a slight delay to ensure the other modal opens
    setTimeout(() => {
      setShowInsufficientCreditsModal(false);
      setInsufficientDetails(null);
    }, 100);
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
          done={progress?.done || 0}
          total={progress?.total || 0}
          isDone={
            progress?.status === "finished" ||
            ((progress?.total || 0) > 0 && (progress?.done || 0) >= (progress?.total || 0))
          }          // NEW
          files={progress?.files || null}                   // NEW
          onViewResults={loadAndShowResults}
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

      {/* Insufficient Credits Modal */}
      {showInsufficientCreditsModal && (
        <InsufficientCreditsModal
          onClose={() => {
            setShowInsufficientCreditsModal(false);
            setInsufficientDetails(null);
          }}
          onBuyCredits={handleBuyCredits}
          creditsNeeded={insufficientDetails?.needed ?? null}
          creditsAvailable={insufficientDetails?.available ?? null}
        />
      )}

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
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
          <input
            type="file"
            accept={ACCEPT_ATTR}
            onChange={handleFileChange}
            id="file-upload"
            className="file-input"
          />
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
                <span className="upload-text">Drop your file here or click to browse</span>
                <span className="upload-subtext">
                  Supports {SUPPORTED_EXTENSIONS.join(", ")}
                </span>
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
function UploadingView({ fileName, progress, emailCount, done, total, isDone, onViewResults }) {
  const safeProgress = Math.max(0, Math.min(100, Number.isFinite(progress) ? progress : 0));
  const circumference = 2 * Math.PI * 85;
  const offset = circumference - (safeProgress / 100) * circumference;

  return (
    <div className="uploading-section fade-in">
      <div className="uploading-card">
        {/* ... chart ... */}
        <div className="uploading-center">
          <div className="uploading-percentage">{Math.round(safeProgress)}%</div>
          <div className="uploading-label">{isDone ? "Completed" : "Uploading"}</div>
        </div>
        {/* progress numbers ... */}

        <div className="uploading-spinner-container">
          {!isDone && <div className="uploading-spinner"></div>}
        </div>

        <button
          className="verify-btn-uploading"
          disabled={!isDone}
          onClick={isDone ? onViewResults : undefined}
        >
          {isDone ? "View Results" : "View Results"}
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
          {result.refunded_credits > 0 && (
            <div className="stat-item">
              <div className="stat-dot" style={{ background: '#00C853' }}></div>
              <span className="stat-label">Refunded</span>
              <span className="stat-value">{result.refunded_credits} Cr</span>
            </div>
          )}
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
            <div className="validation-count">{validation.totalEmails ?? 0}</div>
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
        {validation.duplicates > 0 && (
          <div className="mini-stat" title={`${validation.duplicates} Duplicates`}>
            <span style={{ fontSize: 10, background: '#607D8B', padding: '2px 6px', borderRadius: 4, color: '#fff' }}>
              {validation.duplicates} Dup
            </span>
          </div>
        )}
        {validation.refunded_credits > 0 && (
          <div className="mini-stat" title={`${validation.refunded_credits} Credits Refunded`}>
            <span style={{ fontSize: 10, background: '#00C853', padding: '2px 6px', borderRadius: 4, color: '#fff' }}>
              Ref: {validation.refunded_credits}
            </span>
          </div>
        )}
      </div>

      <button className="verify-btn" onClick={(e) => { e.stopPropagation(); onViewResult(validation); }}>
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
        <div className="stat-card">
          <div className="stat-label">Download</div>
          <div className="stat-value">
            <button
              className="verify-btn"
              disabled={!results?.files?.results_csv}
              onClick={() => {
                if (!results?.files?.results_csv) return;
                const raw = String(results.files.results_csv).replace(/\\/g, "/").trim();
                const url = /^https?:\/\//i.test(raw)
                  ? raw
                  : apiUrl(raw.startsWith("/") ? raw : `/${raw}`);
                try { console.debug("[Bulk] download CSV", url); } catch { }
                window.open(url, "_blank");
              }}
            >
              Download CSV
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {panel === "overview" && (
        <>
          {/* Duplicate & Refund Information Panel */}
          {(results.duplicates > 0 || results.refunded_credits > 0) && (
            <div className="card" style={{ marginBottom: 20, padding: 20, borderLeft: '4px solid #2196F3' }}>
              <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="2" width="24" height="24">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <line x1="20" y1="8" x2="20" y2="14"></line>
                  <line x1="23" y1="11" x2="17" y2="11"></line>
                </svg>
                Duplicate Detection Summary
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginTop: 15 }}>
                <div className="stat-card" style={{ background: 'rgba(33, 150, 243, 0.1)', border: 'none' }}>
                  <div className="stat-label" style={{ color: '#2196F3' }}>Duplicates Found</div>
                  <div className="stat-value" style={{ color: '#2196F3' }}>{results.duplicates}</div>
                </div>
                <div className="stat-card" style={{ background: 'rgba(76, 175, 80, 0.1)', border: 'none' }}>
                  <div className="stat-label" style={{ color: '#4CAF50' }}>New Emails Processed</div>
                  <div className="stat-value" style={{ color: '#4CAF50' }}>{results.new_emails}</div>
                </div>
                {results.refunded_credits > 0 && (
                  <div className="stat-card" style={{ background: 'rgba(0, 200, 83, 0.1)', border: 'none' }}>
                    <div className="stat-label" style={{ color: '#00C853' }}>Credits Refunded</div>
                    <div className="stat-value" style={{ color: '#00C853' }}>{results.refunded_credits}</div>
                  </div>
                )}
              </div>
              {results.refund_success && (
                <div style={{ marginTop: 15, color: '#4CAF50', display: 'flex', alignItems: 'center', gap: 5, fontSize: 14 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  Refund processed successfully to your account.
                </div>
              )}
            </div>
          )}

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
              const csv = [Object.keys(rows[0]).join(','), ...rows.map(r => Object.values(r).map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(','))].join('\n');
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
    localStorage.setItem(historyKey, JSON.stringify(updatedValidations));
    alert('Name updated');
  };

  const handleDelete = () => {
    if (!confirm('Delete this validation from local history?')) return;
    const remaining = validations.filter(v => v.id !== results.id);
    setValidations(remaining);
    localStorage.setItem(historyKey, JSON.stringify(remaining));
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
