// ─── generatePayrollPDF ───────────────────────────────────────────────────────
// Opens a print-optimised HTML page in a new window and triggers window.print().
// The output matches the "Weekly Printed Payroll Report" layout.

export interface PayrollReportData {
  report_title: string;
  shop: {
    name: string;
    display_name?: string;
    store_identifier?: string | null;
  };
  date_range: { from: string; to: string };
  week_ending: string;
  printed_at: string;
  legend: { system_punch: string; manual_punch: string };
  dates: string[];
  date_headers: Array<{ date: string; date_label: string; weekday: string }>;
  employees: Array<{
    employee_name?: string;
    name?: string;
    payroll_id?: string | null;
    weekly_total: {
      total_before_adj: number;
      total_adj: number;
      adj_amount: number;
      total_break_hours: number;
    };
    days: Array<{
      date: string;
      punches: Array<{
        time_label: string;
        hours: number;
        break_hours: number;
        is_system: boolean;
        is_manual: boolean;
      }>;
      total_before_adj: number;
      total_adj: number;
      adj_amount: number;
      total_break_hours: number;
    }>;
    hrs_wrkd: number;
  }>;
  grand_totals: {
    days: Array<{
      date: string;
      total_before_adj: number;
      total_adj: number;
      adj_amount: number;
      total_break_hours: number;
    }>;
    weekly_total: {
      total_before_adj: number;
      total_adj: number;
      adj_amount: number;
      total_break_hours: number;
    };
  };
}

const fmtHrs = (n: number) => (n > 0 ? n.toFixed(2) : "");

export function generatePayrollPDF(data: PayrollReportData): void {
  const { date_headers, employees, grand_totals, legend } = data;
  const shopName = data.shop.display_name ?? data.shop.name;

  // ── Header columns: date cols then fixed cols ─────────────────────────────
  // For readability we rotate date headers. Each date column is narrow.
  const colW = 52; // px per date column
  const fixedCols = [
    { label: "Hrs Wrkd", key: "hrs_wrkd" },
  ];

  // ── Build date header cells ───────────────────────────────────────────────
  const thDates = date_headers
    .map(
      (dh) => `
      <th class="date-col rotate-header">
        <div class="rotate-text">
          <span class="weekday">${dh.weekday.slice(0, 3)}</span>
          <span class="datenum">${dh.date_label.slice(0, 5)}</span>
        </div>
      </th>`,
    )
    .join("");

  // ── Build employee rows ───────────────────────────────────────────────────
  const empRows = employees
    .map((emp, ei) => {
      const name = emp.employee_name ?? emp.name ?? "—";
      const payId = emp.payroll_id ?? "—";

      // Map days by date for O(1) lookup
      const dayMap = new Map(emp.days.map((d) => [d.date, d]));

      const dateCells = date_headers
        .map((dh) => {
          const day = dayMap.get(dh.date);
          if (!day || day.punches.length === 0) return `<td class="date-col"></td>`;

          const punchLines = day.punches
            .map((p) => `<div class="punch">${p.time_label}</div>`)
            .join("");

          return `<td class="date-col has-data">${punchLines}</td>`;
        })
        .join("");

      const rowClass = ei % 2 === 0 ? "row-even" : "row-odd";

      return `
      <tr class="${rowClass} emp-row">
        <td class="emp-name-col">
          <div class="emp-name">${name}</div>
          <div class="emp-id">${payId !== "—" ? `ID: ${payId}` : ""}</div>
        </td>
        ${dateCells}
        <td class="total-col">${fmtHrs(emp.hrs_wrkd) || "0.00"}</td>
      </tr>`;
    })
    .join("");

  // ── Grand total row ───────────────────────────────────────────────────────
  const gtMap = new Map(grand_totals.days.map((d) => [d.date, d]));
  const gtDateCells = date_headers
    .map((dh) => {
      const d = gtMap.get(dh.date);
      const v = d?.total_adj ?? 0;
      return `<td class="date-col total-row-cell">${v > 0 ? v.toFixed(2) : ""}</td>`;
    })
    .join("");

  const gtTotal = grand_totals.weekly_total.total_adj;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>${data.report_title}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Roboto', sans-serif;
    font-size: 9px;
    color: #111;
    background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* ── Page wrapper ── */
  .page {
    padding: 14mm 10mm 10mm 10mm;
    width: 100%;
  }

  /* ── Report header ── */
  .report-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
    border-bottom: 2px solid #222;
    padding-bottom: 6px;
  }
  .report-header-left h1 {
    font-size: 14px;
    font-weight: 700;
    color: #111;
    line-height: 1.2;
  }
  .report-header-left .shop-name {
    font-size: 10px;
    color: #444;
    margin-top: 2px;
  }
  .report-header-right {
    text-align: right;
    font-size: 8.5px;
    color: #555;
    line-height: 1.6;
  }
  .report-header-right strong {
    color: #111;
    font-weight: 700;
  }

  /* ── Sub-header (date range bar) ── */
  .sub-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f3f4f6;
    border: 1px solid #ddd;
    padding: 4px 8px;
    border-radius: 3px;
    margin-bottom: 10px;
    font-size: 8px;
    color: #444;
  }
  .sub-header strong { color: #111; }

  /* ── Main table ── */
  table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }

  /* Employee name column */
  .emp-name-col {
    width: 110px;
    min-width: 110px;
    max-width: 110px;
    padding: 4px 6px;
    border: 1px solid #d1d5db;
    vertical-align: top;
    background: #fff;
  }
  .emp-name { font-weight: 700; font-size: 8.5px; color: #111; word-break: break-word; }
  .emp-id { font-size: 7.5px; color: #888; margin-top: 1px; }

  /* Date columns */
  .date-col {
    width: ${colW}px;
    min-width: ${colW}px;
    max-width: ${colW}px;
    padding: 2px 2px;
    border: 1px solid #d1d5db;
    vertical-align: top;
    text-align: center;
    font-size: 7.5px;
    color: #333;
  }
  .date-col.has-data { background: #fafafa; }

  /* Total column */
  .total-col {
    width: 52px;
    min-width: 52px;
    padding: 4px 4px;
    border: 1px solid #d1d5db;
    text-align: center;
    font-weight: 700;
    font-size: 8.5px;
    vertical-align: middle;
    background: #f9fafb;
  }

  /* Punch entries */
  .punch {
    font-size: 7px;
    line-height: 1.4;
    color: #1a1a2e;
    white-space: nowrap;
  }

  /* Header row */
  thead tr th {
    background: #1e293b;
    color: #fff;
    font-weight: 700;
    font-size: 8px;
    border: 1px solid #1e293b;
    text-align: center;
    vertical-align: bottom;
    padding: 4px 2px;
  }
  thead tr th.emp-name-col {
    text-align: left;
    padding-left: 6px;
  }

  /* Rotated date header */
  .rotate-header {
    height: 70px;
    vertical-align: bottom;
    padding: 0 !important;
  }
  .rotate-text {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    height: 100%;
    padding-bottom: 4px;
    gap: 1px;
  }
  .weekday {
    font-size: 6.5px;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }
  .datenum {
    font-size: 7.5px;
    font-weight: 700;
    color: #fff;
  }

  /* Row striping */
  .row-even td { background: #fff; }
  .row-odd td { background: #f8fafc; }

  /* Total row */
  .grand-total-row td {
    background: #1e293b !important;
    color: #fff !important;
    font-weight: 700;
    font-size: 8.5px;
    border: 1px solid #1e293b;
    padding: 5px 4px;
    text-align: center;
  }
  .grand-total-row td.emp-name-col {
    text-align: left;
    padding-left: 8px;
    font-size: 9px;
    letter-spacing: 0.3px;
    text-transform: uppercase;
  }
  .total-row-cell {
    font-size: 7.5px !important;
    font-weight: 700 !important;
  }

  /* ── Legend ── */
  .legend {
    margin-top: 10px;
    display: flex;
    gap: 18px;
    font-size: 7.5px;
    color: #666;
    border-top: 1px solid #e5e7eb;
    padding-top: 6px;
  }
  .legend span { color: #111; font-weight: 700; }

  /* ── Signature block ── */
  .signature-block {
    display: flex;
    gap: 40px;
    margin-top: 24px;
  }
  .sig-line {
    flex: 1;
    border-top: 1px solid #aaa;
    padding-top: 4px;
    font-size: 8px;
    color: #555;
    text-align: center;
  }

  /* ── Print media ── */
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    @page {
      size: A3 landscape;
      margin: 8mm;
    }
    .page { padding: 0; }
  }
</style>
</head>
<body>
<div class="page">

  <!-- Report Header -->
  <div class="report-header">
    <div class="report-header-left">
      <h1>${data.report_title}</h1>
      <div class="shop-name">${shopName}${data.shop.store_identifier ? ` · ${data.shop.store_identifier}` : ""}</div>
    </div>
    <div class="report-header-right">
      <div><strong>Period:</strong> ${data.date_range.from} → ${data.date_range.to}</div>
      <div><strong>Week Ending:</strong> ${data.week_ending}</div>
      <div><strong>Printed:</strong> ${data.printed_at}</div>
    </div>
  </div>

  <!-- Sub header -->
  <div class="sub-header">
    <div>Date range: <strong>${data.date_range.from}</strong> to <strong>${data.date_range.to}</strong></div>
    <div>Total Employees: <strong>${employees.length}</strong></div>
    <div>Total Hours Worked: <strong>${fmtHrs(grand_totals.weekly_total.total_adj)}</strong></div>
  </div>

  <!-- Main Table -->
  <table>
    <thead>
      <tr>
        <th class="emp-name-col">Employee</th>
        ${thDates}
        <th class="total-col">Hrs<br/>Wrkd</th>
      </tr>
    </thead>
    <tbody>
      ${empRows}
      <!-- Grand Total Row -->
      <tr class="grand-total-row">
        <td class="emp-name-col">Grand Total</td>
        ${gtDateCells}
        <td class="total-col">${fmtHrs(gtTotal) || "0.00"}</td>
      </tr>
    </tbody>
  </table>

  <!-- Legend -->
  <div class="legend">
    <div><span>^</span> ${legend.system_punch.replace("^ ", "")}</div>
    <div><span>*</span> ${legend.manual_punch.replace("* ", "")}</div>
  </div>

  <!-- Signature block -->
  <div class="signature-block">
    <div class="sig-line">Manager Signature</div>
    <div class="sig-line">Date</div>
    <div class="sig-line">Employee Signature</div>
  </div>

</div>
<script>
  // Auto-print after fonts load
  window.onload = function() {
    setTimeout(function() { window.print(); }, 500);
  };
</script>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) {
    alert("Pop-up blocked. Allow pop-ups and try again.");
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
}
