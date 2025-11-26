import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getBillingSummary, getBillingUsage } from "../api";
import { getToken } from "../auth";
import "./ProfileSection.css";
import "./BillingSection.css";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function BillingSection() {
  // Sidebar state
  const [activeSub, setActiveSub] = useState("usage");
  const billingOpen = true;
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // KPI state
  const [stats, setStats] = useState({ creditBalance: 0, lastAdded: null, timeUntilDepletion: null });

  // Filters
  const [interval, setInterval] = useState("Daily");
  const [range, setRange] = useState(() => {
    const end = new Date();
    const start = new Date(end);
    start.setDate(end.getDate() - 6);
    return { start, end };
  });

  // Usage
  const [series, setSeries] = useState([]);
  const [totals, setTotals] = useState({ bulk: 0, single: 0, api: 0, other: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState('graph'); // 'graph' or 'table'

  const rangeLabel = useMemo(() => {
    const fmt = (d) => d.toLocaleDateString("en-US");
    return `${fmt(range.start)} - ${fmt(range.end)}`;
  }, [range]);

  const normalizedInterval = (v) => v.toLowerCase();

  async function refresh() {
    try {
      setLoading(true);
      setError("");
      const token = getToken?.() || localStorage.getItem("accessToken") || localStorage.getItem("token") || "";
      const [summary, usage] = await Promise.all([
        getBillingSummary(token),
        getBillingUsage(
          {
            startISO: new Date(range.start.getFullYear(), range.start.getMonth(), range.start.getDate()).toISOString(),
            endISO: new Date(range.end.getFullYear(), range.end.getMonth(), range.end.getDate() + 1).toISOString(),
            interval: normalizedInterval(interval),
          },
          token
        ),
      ]);

      setStats({
        creditBalance: Number(summary.creditBalance || 0),
        lastAdded: summary.lastAdded ? new Date(summary.lastAdded).toLocaleDateString("en-US") : "-",
        timeUntilDepletion: summary.timeUntilDepletionMonths
          ? `${Math.max(0, summary.timeUntilDepletionMonths).toFixed(1)} months`
          : "-",
      });

      setSeries(Array.isArray(usage.series) ? usage.series : []);
      setTotals(usage.totals || { bulk: 0, single: 0, api: 0, other: 0 });
    } catch (e) {
      setError(e?.message || "Failed to load billing");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);
  useEffect(() => { refresh(); }, [interval, range.start, range.end]);

  // Date handlers
  const onStartChange = (e) => {
    const d = new Date(e.target.value);
    if (!isNaN(d)) setRange((r) => ({ ...r, start: d }));
  };
  const onEndChange = (e) => {
    const d = new Date(e.target.value);
    if (!isNaN(d)) setRange((r) => ({ ...r, end: d }));
  };
  const fmtDateInput = (d) => d.toISOString().slice(0, 10);

  const totalForRow = (r) => (r.bulk || 0) + (r.single || 0) + (r.api || 0) + (r.other || 0);

  // Prepare data for graph
  const graphData = useMemo(() => {
    return series.map(item => ({
      name: item.date ? new Date(item.date).toLocaleDateString("en-US", { month: 'short', day: 'numeric' }) : item.label,
      Bulk: item.bulk || 0,
      Single: item.single || 0,
      // API: item.api || 0,
    }));
  }, [series]);

  return (
    <div className="profile-layout">
      <aside className="profile-sidebar">
        <nav className="profile-nav">
          <button className="profile-nav-item" onClick={() => window.dispatchEvent(new CustomEvent("openProfileTab"))}>
            <span className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M6 20c0-3.31 2.69-6 6-6s6 2.69 6 6" /></svg>
            </span>
            Profile
          </button>
          <button className="profile-nav-item" onClick={() => window.dispatchEvent(new CustomEvent("openAccountTab"))}>
            <span className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12h8" /></svg>
            </span>
            Account
          </button>
          <button className="profile-nav-item active">
            <span className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 10h18" /></svg>
            </span>
            Billing
          </button>
          {billingOpen && (
            <div className="profile-subnav">
              <button onClick={() => { setActiveSub("usage"); scrollTo("billing-usage"); }} className={`profile-subnav-item ${activeSub === "usage" ? "active" : ""}`}>Credit Usage</button>
              <button onClick={() => { setActiveSub("subscriptions"); scrollTo("billing-subscriptions"); }} className={`profile-subnav-item ${activeSub === "subscriptions" ? "active" : ""}`}>Subscriptions</button>
              <button onClick={() => { setActiveSub("autoref"); scrollTo("billing-autoref"); }} className={`profile-subnav-item ${activeSub === "autoref" ? "active" : ""}`}>Auto-Refill</button>
              <button onClick={() => { setActiveSub("payments"); scrollTo("billing-payments"); }} className={`profile-subnav-item ${activeSub === "payments" ? "active" : ""}`}>Payment Methods</button>
              <button onClick={() => { setActiveSub("invoices"); scrollTo("billing-invoices"); }} className={`profile-subnav-item ${activeSub === "invoices" ? "active" : ""}`}>Invoices</button>
            </div>
          )}
        </nav>
      </aside>

      <div className="profile-content-wrapper">
        <div className="profile-content">
          <div className="billing-breadcrumb"><span className="dot" /> Billing</div>

          {/* KPIs */}
          <div className="billing-kpis">
            <div className="kpi-card"><div className="kpi-label">CREDIT BALANCE</div><div className="kpi-value">{stats.creditBalance.toLocaleString()}</div></div>
            <div className="kpi-card"><div className="kpi-label">CREDITS LAST ADDED</div><div className="kpi-value">{stats.lastAdded || "-"}</div></div>
            <div className="kpi-card"><div className="kpi-label">TIME UNTIL DEPLETION</div><div className="kpi-value">{stats.timeUntilDepletion || "-"}</div></div>
          </div>

          {/* Usage */}
          <div className="billing-card" id="billing-usage">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div className="billing-card-title" style={{ marginBottom: 0 }}>Credit Usage</div>
              <div className="view-toggle">
                <button
                  className={`toggle-btn-credit ${viewMode === 'graph' ? 'active' : ''}`}
                  onClick={() => setViewMode('graph')}
                >
                  Graph
                </button>
                <button
                  className={`toggle-btn-credit ${viewMode === 'table' ? 'active' : ''}`}
                  onClick={() => setViewMode('table')}
                >
                  Table
                </button>
              </div>
            </div>

            <div className="usage-controls">
              <div className="control"><label>Start</label><input type="date" className="profile-input" value={fmtDateInput(range.start)} onChange={onStartChange} /></div>
              <div className="control"><label>End</label><input type="date" className="profile-input" value={fmtDateInput(range.end)} onChange={onEndChange} /></div>
              <div className="control"><label>Interval</label>
                <select className="profile-input" value={interval} onChange={(e) => setInterval(e.target.value)}>
                  <option>Hourly</option>
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
              </div>
              <div className="control range-label"><span>{rangeLabel}</span></div>
            </div>

            {error && <div className="error-text">{error}</div>}

            <div className="usage-totals">
              <div className="total-item"><span className="label">Bulk</span><span className="value">{totals.bulk}</span></div>
              <div className="total-item"><span className="label">Single</span><span className="value">{totals.single}</span></div>
              {/* <div className="total-item"><span className="label">API</span><span className="value">{totals.api}</span></div> */}
              {/* <div className="total-item"><span className="label">Other</span><span className="value">{totals.other}</span></div> */}
            </div>

            {viewMode === 'graph' ? (
              <div className="usage-graph-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={graphData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2f2f2f" vertical={false} />
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111', border: '1px solid #2f2f2f', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                      cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                    />
                    <Bar dataKey="Bulk" fill="#8884d8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Single" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="usage-table-wrap">
                <table className="usage-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Bulk</th>
                      <th>Single</th>
                      {/* <th>API</th> */}
                      {/* <th>Other</th> */}
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={6} className="loading-row">Loading…</td></tr>
                    ) : series.length === 0 ? (
                      <tr><td colSpan={6} className="empty-row">No usage in this range</td></tr>
                    ) : (
                      series.map((r, idx) => (
                        <tr key={idx}>
                          <td>{r.date ? new Date(r.date).toLocaleDateString("en-US") : r.label || "-"}</td>
                          <td>{r.bulk || 0}</td>
                          <td>{r.single || 0}</td>
                          {/* <td>{r.api || 0}</td> */}
                          {/* <td>{r.other || 0}</td> */}
                          <td className="bold">{totalForRow(r)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Subscriptions */}
          <div className="billing-card" id="billing-subscriptions">
            <div className="billing-card-title">Subscriptions</div>
            <div className="sub-desc">Purchase credits on a recurring basis to save money and have consistent billing.</div>
            <Link to="/signup"><button className="btn-primary small">GET STARTED</button></Link>
          </div>

          {/* Auto-refill */}
          <div className="billing-card" id="billing-autoref">
            <div className="billing-card-title">Auto-Refill</div>
            <div className="sub-desc">Automatically purchase credits when your balance drops below a threshold.</div>
          </div>

          {/* Payment Methods */}
          <div className="billing-card" id="billing-payments">
            <div className="billing-card-title">Payment Methods</div>
            <div className="sub-desc">Add and manage your payment cards and billing details.</div>
          </div>

          {/* Invoices */}
          <div className="billing-card" id="billing-invoices">
            <div className="billing-card-title">Invoices</div>
            <div className="sub-desc">View and download your invoices and billing history.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
