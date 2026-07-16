import { PayrollReportData } from "./generatePayrollPDF";

type RGB = [number, number, number];

export async function downloadPayrollPDFCanvas(
  data: PayrollReportData,
): Promise<void> {
  const { default: jsPDF } = await import("jspdf");

  const { date_headers, employees, grand_totals } = data;
  const shopName = data.shop.display_name ?? data.shop.name;
  const storeId = data.shop.store_identifier;

  // ── Layout constants (all in mm) ──────────────────────────────────────────
  const M = 10; // page margin
  const PAD = 1.8; // cell inner padding
  const LH = 3.6; // single line height in mm
  const BODY_FS = 7; // body font size (pt)
  const HEAD_FS = 8; // header font size (pt)

  // Column widths
  const CW_ID = 13;
  const CW_NAME = 40;
  const CW_HRS = 17;
  const N = date_headers.length;
  // Give each date col enough room to show "dd/mm/yyyy" + weekday
  // No artificial cap — let the page grow as wide as needed
  const CW_DATE = Math.max(18, Math.ceil(200 / N));

  const TABLE_W = CW_ID + CW_NAME + N * CW_DATE + CW_HRS;
  const PAGE_W = TABLE_W + M * 2;

  // Row heights
  const ROW_H_TH = 14; // table header row
  const ROW_H_TOTAL = 6.5; // each of the 3 total rows per employee
  const PUNCH_ROW_H = LH * 2 + PAD * 2; // punch block per punch line

  // ── Pre-compute per-employee metrics ─────────────────────────────────────
  type EmpMeta = {
    emp: (typeof employees)[0];
    dayMap: Map<string, (typeof employees)[0]["days"][0]>;
    maxPunches: number;
    punchBlockH: number;
    totalBlockH: number;
  };

  const metas: EmpMeta[] = employees.map((emp) => {
    const dayMap = new Map(emp.days.map((d) => [d.date, d]));
    const maxPunches = Math.max(
      1,
      ...date_headers.map((dh) => dayMap.get(dh.date)?.punches.length ?? 0),
    );
    return {
      emp,
      dayMap,
      maxPunches,
      punchBlockH: maxPunches * PUNCH_ROW_H,
      totalBlockH: 3 * ROW_H_TOTAL,
    };
  });

  // ── Total page height ─────────────────────────────────────────────────────
  const totalEmpH = metas.reduce(
    (s, m) => s + m.punchBlockH + m.totalBlockH,
    0,
  );
  const PAGE_H =
    M + 14 + 10 + ROW_H_TH + totalEmpH + (ROW_H_TOTAL + 2) + M + 5;

  // ── Create doc ────────────────────────────────────────────────────────────
  // jsPDF swaps format[w,h] when orientation doesn't match the aspect ratio:
  //   portrait  + [648, 150] → jsPDF swaps → [150, 648] → crops content!
  //   landscape + [648, 150] → jsPDF keeps  → [648, 150] → correct ✓
  // So orientation MUST match: wide content = landscape, tall = portrait.
  const orientation = PAGE_W > PAGE_H ? "landscape" : "portrait";
  const doc = new jsPDF({
    orientation,
    unit: "mm",
    format: [PAGE_W, PAGE_H],
  });

  // ── Helpers ───────────────────────────────────────────────────────────────
  const setF = (bold = false, size = BODY_FS) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
  };

  const setColor = (rgb: RGB) => doc.setTextColor(...rgb);

  const cell = (
    x: number,
    y: number,
    w: number,
    h: number,
    fill?: RGB,
  ) => {
    doc.setLineWidth(0.18);
    doc.setDrawColor(170, 170, 170);
    if (fill) {
      doc.setFillColor(...fill);
      doc.rect(x, y, w, h, "FD");
    } else {
      doc.setFillColor(255, 255, 255);
      doc.rect(x, y, w, h, "D");
    }
  };

  const text = (
    str: string,
    x: number,
    y: number,
    align: "left" | "right" | "center" = "left",
    color: RGB = [0, 0, 0],
  ) => {
    doc.setTextColor(...color);
    doc.text(str, x, y, { align });
  };

  // ── Report header ─────────────────────────────────────────────────────────
  let y = M;

  // Store (left)
  setF(false, 9);
  const storeLabel = "Store:  ";
  const storeW = doc.getTextWidth(storeLabel);
  text(storeLabel, M, y + 4);
  setF(true, 9);
  text(`${shopName}${storeId ? `(${storeId})` : ""}`, M + storeW, y + 4);

  // Title (center)
  setF(true, 15);
  text("Weekly Printed Payroll Report", PAGE_W / 2, y + 5, "center");

  // Week ending + Printed (right) — measure value width first, place label left of it
  setF(true, 8);
  const weVal = data.week_ending;
  const weValW = doc.getTextWidth(weVal);
  text(weVal, PAGE_W - M, y + 3, "right");
  setF(false, 8);
  text("Week ending: ", PAGE_W - M - weValW - 1, y + 3, "right");

  setF(true, 8);
  const prVal = data.printed_at;
  const prValW = doc.getTextWidth(prVal);
  text(prVal, PAGE_W - M, y + 8, "right");
  setF(false, 8);
  text("Printed: ", PAGE_W - M - prValW - 1, y + 8, "right");

  y += 14;

  // ── Legend ────────────────────────────────────────────────────────────────
  setF(false, 7);
  text("^ Indicates system time punch", M, y + 3, "left", [37, 99, 235]);
  text(
    "* Indicates a user-edited time punch",
    M,
    y + 7,
    "left",
    [180, 83, 9],
  );
  y += 11;

  // ── Table header row ──────────────────────────────────────────────────────
  let x = M;
  const GREY: RGB = [235, 237, 240];

  // User ID + Name (merged)
  cell(x, y, CW_ID + CW_NAME, ROW_H_TH, GREY);
  setF(true, HEAD_FS);
  text("User ID /", x + PAD, y + 4.5);
  text("Payroll    Employee Name", x + PAD, y + 9.5);
  x += CW_ID + CW_NAME;

  // Date cols
  for (const dh of date_headers) {
    cell(x, y, CW_DATE, ROW_H_TH, GREY);
    setF(true, 6.5);
    text(dh.date_label, x + PAD, y + 5);
    text(dh.weekday, x + PAD, y + 9.5);
    x += CW_DATE;
  }

  // Hrs Wrkd
  cell(x, y, CW_HRS, ROW_H_TH, GREY);
  setF(true, HEAD_FS);
  text("Hrs", x + CW_HRS - PAD, y + 5, "right");
  text("Wrkd", x + CW_HRS - PAD, y + 9.5, "right");

  y += ROW_H_TH;

  // ── Employee rows ─────────────────────────────────────────────────────────
  for (const { emp, dayMap, maxPunches, punchBlockH } of metas) {
    const name = emp.employee_name ?? emp.name ?? "—";
    const payId = String(emp.payroll_id ?? "");

    // ID cell (tall — spans all punch rows)
    cell(M, y, CW_ID, punchBlockH);
    setF(false, BODY_FS);
    text(payId, M + PAD, y + LH + 0.5);

    // Name cell (tall)
    cell(M + CW_ID, y, CW_NAME, punchBlockH);
    const nameLines = doc.splitTextToSize(name, CW_NAME - PAD * 2) as string[];
    setF(false, BODY_FS);
    nameLines.forEach((line: string, li: number) => {
      text(line, M + CW_ID + PAD, y + LH + 0.5 + li * LH);
    });

    // Hrs Wrkd cell (tall)
    cell(M + CW_ID + CW_NAME + N * CW_DATE, y, CW_HRS, punchBlockH);

    // Punch rows
    for (let pi = 0; pi < maxPunches; pi++) {
      const py = y + pi * PUNCH_ROW_H;
      x = M + CW_ID + CW_NAME;

      for (const dh of date_headers) {
        const punch = dayMap.get(dh.date)?.punches[pi];
        cell(x, py, CW_DATE, PUNCH_ROW_H);
        if (punch) {
          setF(false, BODY_FS);
          text(punch.time_label, x + PAD, py + LH);
          text("Hrs", x + PAD, py + LH * 2 + 0.5);
          text(
            punch.hours.toFixed(2),
            x + CW_DATE - PAD,
            py + LH * 2 + 0.5,
            "right",
          );
        }
        x += CW_DATE;
      }
    }

    y += punchBlockH;

    // ── 3 total sub-rows per employee ────────────────────────────────────
    const LABELS = ["TOTAL Adj.", "TOTAL Before Adj.", "Adj. Amount"];
    const dayVals = [
      (d: any) => d?.total_adj ?? 0,
      (d: any) => d?.total_before_adj ?? 0,
      (d: any) => d?.adj_amount ?? 0,
    ];
    const empVals = [
      () => emp.weekly_total.total_adj,
      () => emp.weekly_total.total_before_adj,
      () => emp.weekly_total.adj_amount,
    ];
    const fmts = [
      (n: number) => n.toFixed(2),
      (n: number) => n.toFixed(2),
      (n: number) => (n >= 0 ? "+" : "") + n.toFixed(2),
    ];

    for (let ti = 0; ti < 3; ti++) {
      x = M;

      // Label
      cell(x, y, CW_ID + CW_NAME, ROW_H_TOTAL);
      setF(true, BODY_FS);
      text(LABELS[ti], x + PAD, y + ROW_H_TOTAL - PAD);
      x += CW_ID + CW_NAME;

      // Date values
      for (const dh of date_headers) {
        cell(x, y, CW_DATE, ROW_H_TOTAL);
        setF(true, BODY_FS);
        text(
          fmts[ti](dayVals[ti](dayMap.get(dh.date))),
          x + CW_DATE - PAD,
          y + ROW_H_TOTAL - PAD,
          "right",
        );
        x += CW_DATE;
      }

      // Employee total
      cell(x, y, CW_HRS, ROW_H_TOTAL);
      setF(true, BODY_FS);
      text(
        fmts[ti](empVals[ti]()),
        x + CW_HRS - PAD,
        y + ROW_H_TOTAL - PAD,
        "right",
      );

      // Dashed separator after last total row
      if (ti === 2) {
        doc.setLineDashPattern([1, 1], 0);
        doc.setLineWidth(0.4);
        doc.setDrawColor(140, 140, 140);
        doc.line(M, y + ROW_H_TOTAL, M + TABLE_W, y + ROW_H_TOTAL);
        doc.setLineDashPattern([], 0);
        doc.setDrawColor(170, 170, 170);
      }

      y += ROW_H_TOTAL;
    }
  }

  // ── Grand Total row ───────────────────────────────────────────────────────
  const GT_H = ROW_H_TOTAL + 2;
  const gtMap = new Map(grand_totals.days.map((d) => [d.date, d]));
  const GT_FILL: RGB = [225, 228, 232];

  x = M;
  cell(x, y, CW_ID + CW_NAME, GT_H, GT_FILL);
  setF(true, 9);
  text("Grand Total", x + PAD, y + GT_H - PAD);
  x += CW_ID + CW_NAME;

  for (const dh of date_headers) {
    cell(x, y, CW_DATE, GT_H, GT_FILL);
    setF(true, BODY_FS);
    text(
      (gtMap.get(dh.date)?.total_adj ?? 0).toFixed(2),
      x + CW_DATE - PAD,
      y + GT_H - PAD,
      "right",
    );
    x += CW_DATE;
  }

  cell(x, y, CW_HRS, GT_H, GT_FILL);
  setF(true, BODY_FS);
  text(
    grand_totals.weekly_total.total_adj.toFixed(2),
    x + CW_HRS - PAD,
    y + GT_H - PAD,
    "right",
  );

  // ── Save ──────────────────────────────────────────────────────────────────
  doc.save(`${data.report_title} - ${shopName}.pdf`);
}
