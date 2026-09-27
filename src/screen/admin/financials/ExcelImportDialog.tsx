import React, { useRef, useState } from "react";
import * as XLSX from "xlsx";
import {
  X,
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Button from "../../../components/common/Button";

// ── Types ────────────────────────────────────────────────────────────────────

export interface ShopwiseWeeklyImportRow {
  weekLabel: string; // e.g. 'WEEK-1 29-12-2025 To 04-01-2026'
  weekNumber: number;
  storeName: string; // already lowercased
  grossSales: number;
  vat: number;
  customerCount: number;
  justEatSale: number;
  justCharge: number;
  justEatVat: number;
  justEatBankReceived: number;
  justEatVariance: number;
  uberEatSale: number;
  uberEatCharge: number;
  uberEatVat: number;
  uberEatBankReceived: number;
  uberAdvertise: number;
  uberDiscount: number;
  deliverooSale: number;
  deliverooCharge: number;
  deliverooVat: number;
  deliverooBankReceived: number;
  deliverooVariance: number;
  labourHours: number;
  bidFood: number;
  instoreFoodCost: number;
  instoreLabourCost: number;
  bidfoodPreviousWeek: number;
}

export interface WeeklyImportRow {
  weekNumber: number;
  weekRangeLabel: string;
  sales: number;
  commission: number;
}

export interface MonthlyImportRow {
  storeName: string; // already lowercased
  grossSale: number;
  netSale: number;
  customerCount: number;
  bidfood: number;
  labourHour: number;
  revScoreQ1: number;
}

export type ImportedData =
  | { type: "shopwise_week"; rows: ShopwiseWeeklyImportRow[] }
  | { type: "weekly"; rows: WeeklyImportRow[] }
  | { type: "monthly"; rows: MonthlyImportRow[] };

interface Props {
  isOpen: boolean;
  activeTab: "shopwise_week" | "weekly" | "month";
  onClose: () => void;
  onImport: (data: ImportedData) => void;
  /** Known shop names from the system — used to show unmatched warnings */
  knownShopNames?: string[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const num = (v: any): number => {
  const n = parseFloat(String(v ?? 0));
  return isNaN(n) ? 0 : n;
};

const SHEET_MAP: Record<"shopwise_week" | "weekly" | "month", string> = {
  shopwise_week: "Jan-Dec 26",
  weekly: "Weekly 2026",
  month: "Monthly Sale 2026",
};

function parseShopwiseWeekly(rows: any[][]): ShopwiseWeeklyImportRow[] {
  const result: ShopwiseWeeklyImportRow[] = [];
  let currentWeekLabel = "";
  let currentWeekNumber = 0;
  let isMonthlyBlock = false;

  for (const row of rows) {
    const colA = String(row[0] ?? "").trim();
    if (colA.toLowerCase() === "monthly") {
      isMonthlyBlock = true;
      continue;
    }

    const colB = String(row[1] ?? "");
    if (colB.toUpperCase().startsWith("WEEK")) {
      isMonthlyBlock = false;
      currentWeekLabel = colB;
      const match = colB.match(/WEEK[\s-]*(\d+)/i);
      currentWeekNumber = match ? parseInt(match[1], 10) : 0;
      continue;
    }

    if (isMonthlyBlock) continue;

    if (!colB || colB === "STORE " || colB.trim() === "") continue;
    // Skip aggregate/total rows — not real stores
    if (colB.trim().toLowerCase() === "total") continue;
    if (
      typeof row[2] !== "number" &&
      isNaN(parseFloat(String(row[2] ?? "")))
    )
      continue;

    result.push({
      weekLabel: currentWeekLabel,
      weekNumber: currentWeekNumber,
      storeName: colB.trim().toLowerCase(),
      grossSales: num(row[2]),
      vat: num(row[3]),
      customerCount: num(row[9]),
      justEatSale: num(row[10]),
      justCharge: num(row[11]),
      justEatVat: num(row[12]),
      justEatBankReceived: num(row[14]),
      justEatVariance: num(row[15]),
      uberEatSale: num(row[16]),
      uberEatCharge: num(row[17]),
      uberEatVat: num(row[18]),
      uberEatBankReceived: num(row[20]),
      uberAdvertise: num(row[21]),
      uberDiscount: num(row[22]),
      deliverooSale: num(row[23]),
      deliverooCharge: num(row[24]),
      deliverooVat: num(row[25]),
      deliverooBankReceived: num(row[27]),
      deliverooVariance: num(row[28]),
      labourHours: num(row[31]),
      bidFood: num(row[34]),
      instoreFoodCost: num(row[37]),
      instoreLabourCost: num(row[38]),
      bidfoodPreviousWeek: num(row[39]),
    });
  }
  return result;
}

function parseWeekly(rows: any[][]): WeeklyImportRow[] {
  const result: WeeklyImportRow[] = [];
  for (const row of rows) {
    if (!row[0] || typeof row[0] !== "number") continue;
    if (!row[2]) continue;
    result.push({
      weekNumber: num(row[0]),
      weekRangeLabel: String(row[1] ?? ""),
      sales: num(row[2]),
      commission: num(row[8]),
    });
  }
  return result;
}

function parseMonthly(rows: any[][]): MonthlyImportRow[] {
  const result: MonthlyImportRow[] = [];
  for (const row of rows) {
    const storeName = String(row[1] ?? "").trim();
    if (!storeName || storeName.toUpperCase().startsWith("STORE")) continue;
    // Skip aggregate/total rows
    if (storeName.toLowerCase() === "total") continue;
    if (
      typeof row[2] !== "number" &&
      isNaN(parseFloat(String(row[2] ?? "")))
    )
      continue;
    result.push({
      storeName: storeName.toLowerCase(),
      grossSale: num(row[2]),
      netSale: num(row[3]),
      customerCount: num(row[6]),
      bidfood: num(row[7]),
      labourHour: num(row[9]),
      revScoreQ1: num(row[14]),
    });
  }
  return result;
}

/** Returns lowercased Excel store names that don't match any known shop */
function findUnmatched(
  parsed: ImportedData,
  knownShopNames: string[],
): string[] {
  const known = new Set(knownShopNames.map((n) => n.toLowerCase().trim()));
  if (parsed.type === "shopwise_week" || parsed.type === "monthly") {
    const excelNames = [
      ...new Set(parsed.rows.map((r: any) => r.storeName as string)),
    ];
    return excelNames.filter((name) => !known.has(name.trim()));
  }
  return [];
}

// ── Component ─────────────────────────────────────────────────────────────────

const ExcelImportDialog: React.FC<Props> = ({
  isOpen,
  activeTab,
  onClose,
  onImport,
  knownShopNames = [],
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedData, setParsedData] = useState<ImportedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);

  const sheetName = SHEET_MAP[activeTab];

  const reset = () => {
    setParsedData(null);
    setError(null);
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError(null);
    setParsedData(null);
    setParsing(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array", cellDates: true });

        if (!wb.SheetNames.includes(sheetName)) {
          setError(
            `Sheet "${sheetName}" not found.\nAvailable: ${wb.SheetNames.join(", ")}`,
          );
          setParsing(false);
          return;
        }

        const ws = wb.Sheets[sheetName];
        const rawRows: any[][] = XLSX.utils.sheet_to_json(ws, {
          header: 1,
          defval: null,
        });

        let imported: ImportedData;
        if (activeTab === "shopwise_week") {
          const rows = parseShopwiseWeekly(rawRows);
          if (rows.length === 0)
            throw new Error("No store data rows found in sheet.");
          imported = { type: "shopwise_week", rows };
        } else if (activeTab === "weekly") {
          const rows = parseWeekly(rawRows);
          if (rows.length === 0)
            throw new Error("No weekly data rows found in sheet.");
          imported = { type: "weekly", rows };
        } else {
          const rows = parseMonthly(rawRows);
          if (rows.length === 0)
            throw new Error("No monthly data rows found in sheet.");
          imported = { type: "monthly", rows };
        }

        setParsedData(imported);
      } catch (err: any) {
        setError(err?.message ?? "Failed to parse file.");
      } finally {
        setParsing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleConfirm = () => {
    if (!parsedData) return;
    onImport(parsedData);
    handleClose();
  };

  const TAB_LABELS: Record<string, string> = {
    shopwise_week: "Shopwise Weekly",
    weekly: "Weekly",
    month: "Monthly",
  };

  if (!isOpen) return null;

  const unmatched =
    parsedData && knownShopNames.length > 0
      ? findUnmatched(parsedData, knownShopNames)
      : [];

  const summaryLine = (): string => {
    if (!parsedData) return "";
    if (parsedData.type === "shopwise_week") {
      const weeks = new Set(parsedData.rows.map((r) => r.weekNumber)).size;
      return `${weeks} week${weeks !== 1 ? "s" : ""} · ${parsedData.rows.length} store-week records`;
    }
    if (parsedData.type === "weekly") {
      return `${parsedData.rows.length} week row${parsedData.rows.length !== 1 ? "s" : ""}`;
    }
    return `${parsedData.rows.length} store row${parsedData.rows.length !== 1 ? "s" : ""}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet size={17} className="text-emerald-500" />
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                Import from Excel
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Sheet:{" "}
                <span className="font-semibold text-slate-600">
                  {sheetName}
                </span>
                {" · "}
                {TAB_LABELS[activeTab]}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-3">
          {/* Drop zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2.5 border-2 border-dashed border-slate-200 rounded-xl py-7 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-colors"
          >
            <Upload size={22} className="text-slate-300" />
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-600">
                {fileName ?? "Click to select Excel file"}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">.xlsx or .xls</p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleFile}
          />

          {/* Parsing spinner */}
          {parsing && (
            <div className="flex items-center gap-2 text-xs text-slate-500 px-1">
              <div className="w-3 h-3 border-2 border-slate-200 border-t-emerald-500 rounded-full animate-spin shrink-0" />
              Parsing spreadsheet…
            </div>
          )}

          {/* Parse error */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-xl p-3.5">
              <AlertCircle
                size={14}
                className="text-red-400 mt-0.5 shrink-0"
              />
              <p className="text-xs text-red-600 font-medium whitespace-pre-line">
                {error}
              </p>
            </div>
          )}

          {/* Success summary + unmatched warnings */}
          {parsedData && !error && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3.5 py-2.5">
                <CheckCircle2
                  size={14}
                  className="text-emerald-500 shrink-0"
                />
                <p className="text-xs font-semibold text-emerald-700">
                  Ready · {summaryLine()}
                </p>
              </div>

              {unmatched.length > 0 && (
                <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl p-3.5">
                  <AlertCircle
                    size={14}
                    className="text-amber-500 mt-0.5 shrink-0"
                  />
                  <div>
                    <p className="text-xs font-semibold text-amber-700 mb-1.5">
                      {unmatched.length} store
                      {unmatched.length !== 1 ? "s" : ""} not found in system
                      — will be skipped:
                    </p>
                    <ul className="space-y-0.5">
                      {unmatched.map((name) => (
                        <li
                          key={name}
                          className="text-[11px] text-amber-600 font-mono"
                        >
                          "{name}"
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={!parsedData || !!error}
            leftIcon={<Upload size={13} />}
          >
            Fill into table
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExcelImportDialog;
