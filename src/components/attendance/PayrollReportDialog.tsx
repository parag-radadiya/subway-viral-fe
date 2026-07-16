import React, { useState } from "react";
import { Download, X, Loader2 } from "lucide-react";
import { PayrollReportData } from "../../utils/generatePayrollPDF";
import { downloadPayrollPDFCanvas } from "../../utils/payrollPDFCanvas";

interface PayrollReportDialogProps {
  data: PayrollReportData | null;
  onClose: () => void;
}

const fmt = (n: number) => n.toFixed(2);
const fmtSign = (n: number) => (n >= 0 ? `+${n.toFixed(2)}` : n.toFixed(2));

const PayrollReportDialog: React.FC<PayrollReportDialogProps> = ({
  data,
  onClose,
}) => {
  const [downloading, setDownloading] = useState(false);

  if (!data) return null;

  const { date_headers, employees, grand_totals, legend } = data;
  const shopName = data.shop.display_name ?? data.shop.name;
  const storeId = data.shop.store_identifier;

  // ── Download: pure jsPDF canvas drawing ─────────────────────────────────
  const handleDownload = async () => {
    if (!data) return;
    setDownloading(true);
    try {
      await downloadPayrollPDFCanvas(data);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  // ── Shared cell styles ─────────────────────────────────────────────────────
  const cell: React.CSSProperties = {
    border: "1px solid #bbb",
    padding: "6px 8px",
    fontSize: "9.5px",
    verticalAlign: "top",
    lineHeight: "1.5",
  };
  const boldCell: React.CSSProperties = {
    ...cell,
    fontWeight: "bold",
    verticalAlign: "middle",
  };
  const rightBold: React.CSSProperties = {
    ...boldCell,
    textAlign: "right",
  };
  const dashedBottom: React.CSSProperties = {
    borderBottom: "2px dashed #999",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        background: "rgba(15,23,42,0.55)",
        backdropFilter: "blur(4px)",
      }}
    >
      {/* ── Toolbar ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#fff",
          borderBottom: "1px solid #e2e8f0",
          padding: "10px 20px",
          flexShrink: 0,
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={onClose}
            style={{
              padding: "6px",
              borderRadius: "8px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: "#64748b",
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={18} />
          </button>
          <div>
            <p style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", margin: 0 }}>
              {data.report_title}
            </p>
            <p style={{ fontSize: "11px", color: "#94a3b8", margin: 0 }}>
              {shopName} · {data.date_range.from} → {data.date_range.to}
            </p>
          </div>
        </div>

        <button
          onClick={handleDownload}
          disabled={downloading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 18px",
            background: downloading ? "#475569" : "#1e293b",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: 700,
            cursor: downloading ? "not-allowed" : "pointer",
            opacity: downloading ? 0.7 : 1,
          }}
        >
          {downloading
            ? <Loader2 size={14} className="animate-spin" />
            : <Download size={14} />}
          {downloading ? "Opening…" : "Download PDF"}
        </button>
      </div>

      {/* ── Scrollable report ── */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          background: "#f1f5f9",
          padding: "32px",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        {/* Report card */}
        <div
          style={{
            background: "#fff",
            fontFamily: "'Times New Roman', Times, serif",
            color: "#000",
            padding: "28px 32px",
            boxShadow: "0 2px 24px rgba(0,0,0,0.13)",
            display: "inline-block",
            minWidth: "700px",
          }}
        >
          {/* ── Header ── */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "8px",
            }}
          >
            <div style={{ fontSize: "11px" }}>
              Store: <strong>{shopName}{storeId ? `(${storeId})` : ""}</strong>
            </div>
            <div style={{ textAlign: "center", flex: 1, padding: "0 20px" }}>
              <div style={{ fontSize: "18px", fontWeight: "bold" }}>
                Weekly Printed Payroll Report
              </div>
            </div>
            <div style={{ textAlign: "right", fontSize: "10px", whiteSpace: "nowrap" }}>
              <div>Week ending: <strong>{data.week_ending}</strong></div>
              <div>Printed: <strong>{data.printed_at}</strong></div>
            </div>
          </div>

          {/* ── Legend ── */}
          <div style={{ marginBottom: "14px" }}>
            <div style={{ color: "#2563eb", fontSize: "9.5px", marginBottom: "2px" }}>
              ^ Indicates system time punch
            </div>
            <div style={{ color: "#d97706", fontSize: "9.5px" }}>
              * Indicates a user-edited time punch
            </div>
          </div>

          {/* ── Table ── */}
          <table
            style={{
              borderCollapse: "collapse",
              width: "100%",
              tableLayout: "auto",
            }}
          >
            <colgroup>
              <col style={{ width: "42px" }} />
              <col style={{ width: "140px" }} />
              {date_headers.map((_, i) => <col key={i} />)}
              <col style={{ width: "58px" }} />
            </colgroup>

            <thead>
              <tr>
                <th
                  colSpan={2}
                  style={{
                    ...boldCell,
                    textAlign: "left",
                    verticalAlign: "bottom",
                    whiteSpace: "nowrap",
                  }}
                >
                  User ID /<br />Payroll&nbsp;&nbsp;&nbsp; Employee Name
                </th>
                {date_headers.map((dh) => (
                  <th
                    key={dh.date}
                    style={{
                      ...boldCell,
                      textAlign: "left",
                      verticalAlign: "bottom",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {dh.date_label}<br />{dh.weekday}
                  </th>
                ))}
                <th style={{ ...boldCell, textAlign: "right", verticalAlign: "bottom", whiteSpace: "nowrap" }}>
                  Hrs Wrkd
                </th>
              </tr>
            </thead>

            <tbody>
              {employees.map((emp, ei) => {
                const name = emp.employee_name ?? emp.name ?? "—";
                const payId = emp.payroll_id ?? String(ei + 1);
                const dayMap = new Map(emp.days.map((d) => [d.date, d]));
                const maxPunches = Math.max(
                  1,
                  ...date_headers.map((dh) => dayMap.get(dh.date)?.punches.length ?? 0),
                );

                return (
                  <React.Fragment key={emp.user_id ?? ei}>
                    {Array.from({ length: maxPunches }).map((_, pi) => (
                      <tr key={pi}>
                        {pi === 0 && (
                          <td rowSpan={maxPunches} style={{ ...cell, borderRight: "none", whiteSpace: "nowrap" }}>
                            {payId}
                          </td>
                        )}
                        {pi === 0 && (
                          <td rowSpan={maxPunches} style={{ ...cell, borderLeft: "none" }}>
                            {name}
                          </td>
                        )}

                        {date_headers.map((dh) => {
                          const punch = dayMap.get(dh.date)?.punches[pi];
                          return (
                            <td key={dh.date} style={{ ...cell, whiteSpace: "nowrap" }}>
                              {punch ? (
                                <>
                                  <div>{punch.time_label}</div>
                                  <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                                    <span>Hrs</span>
                                    <span>{fmt(punch.hours)}</span>
                                  </div>
                                </>
                              ) : null}
                            </td>
                          );
                        })}

                        {pi === 0 && (
                          <td rowSpan={maxPunches} style={{ ...cell, verticalAlign: "top" }} />
                        )}
                      </tr>
                    ))}

                    {/* TOTAL Adj. */}
                    <tr>
                      <td colSpan={2} style={boldCell}>TOTAL Adj.</td>
                      {date_headers.map((dh) => (
                        <td key={dh.date} style={rightBold}>
                          {fmt(dayMap.get(dh.date)?.total_adj ?? 0)}
                        </td>
                      ))}
                      <td style={rightBold}>{fmt(emp.weekly_total.total_adj)}</td>
                    </tr>

                    {/* TOTAL Before Adj. */}
                    <tr>
                      <td colSpan={2} style={boldCell}>TOTAL Before Adj.</td>
                      {date_headers.map((dh) => (
                        <td key={dh.date} style={rightBold}>
                          {fmt(dayMap.get(dh.date)?.total_before_adj ?? 0)}
                        </td>
                      ))}
                      <td style={rightBold}>{fmt(emp.weekly_total.total_before_adj)}</td>
                    </tr>

                    {/* Adj. Amount — dashed separator */}
                    <tr>
                      <td colSpan={2} style={{ ...boldCell, ...dashedBottom }}>Adj. Amount</td>
                      {date_headers.map((dh) => (
                        <td key={dh.date} style={{ ...rightBold, ...dashedBottom }}>
                          {fmtSign(dayMap.get(dh.date)?.adj_amount ?? 0)}
                        </td>
                      ))}
                      <td style={{ ...rightBold, ...dashedBottom }}>
                        {fmtSign(emp.weekly_total.adj_amount)}
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}

              {/* Grand Total */}
              {(() => {
                const gtMap = new Map(grand_totals.days.map((d) => [d.date, d]));
                const gtCell: React.CSSProperties = {
                  ...boldCell,
                  background: "#f3f4f6",
                  border: "1px solid #999",
                  textAlign: "right",
                  fontSize: "10px",
                };
                return (
                  <tr>
                    <td colSpan={2} style={{ ...gtCell, textAlign: "left" }}>
                      Grand Total
                    </td>
                    {date_headers.map((dh) => (
                      <td key={dh.date} style={gtCell}>
                        {fmt(gtMap.get(dh.date)?.total_adj ?? 0)}
                      </td>
                    ))}
                    <td style={gtCell}>{fmt(grand_totals.weekly_total.total_adj)}</td>
                  </tr>
                );
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PayrollReportDialog;
