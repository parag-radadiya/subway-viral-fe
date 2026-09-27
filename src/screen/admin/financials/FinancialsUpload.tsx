import React, { useEffect, useState } from "react";
import { Upload } from "lucide-react";
import Tabs from "../../../components/common/Tabs";
import ShopwiseWeeklySheetView from "./ShopwiseWeeklySheetView";
import WeeklySheetView from "./WeeklySheetView";
import MonthlySheetView from "./MonthlySheetView";
import ExcelImportDialog, {
  type ImportedData,
  type ShopwiseWeeklyImportRow,
  type WeeklyImportRow,
  type MonthlyImportRow,
} from "./ExcelImportDialog";
import { shopsApi } from "../../../config/apiCall";
// import ShopwiseWeeklyFinancialsUpload from "./ShopwiseWeeklyFinancialsUpload"; // commented – replaced by sheet view
// import MonthlyFinancialsUpload from "./MonthlyFinancialsUpload"; // commented – replaced by sheet view
// import YearlyFinancialsUpload from "./YearlyFinancialsUpload"; // commented – replaced by sheet view
// import WeeklyFinancialsUpload from "./WeeklyFinancialsUpload"; // commented – replaced by sheet view
// import ShopwiseWeeklySheetView from "./ShopwiseWeeklySheetView";
// import WeeklySheetView from "./WeeklySheetView";
// import MonthlySheetView from "./MonthlySheetView";

const FinancialsUpload: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "shopwise_week" | "weekly" | "month" | "year"
  >("shopwise_week");

  const [importDialogOpen, setImportDialogOpen] = useState(false);

  // Shop names for unmatched-store validation in the dialog
  const [shopNames, setShopNames] = useState<string[]>([]);
  useEffect(() => {
    shopsApi
      .list()
      .then((res: any) => {
        const data = res.data?.data;
        const loaded: any[] = (data?.shops || data?.data || []).filter(
          (s: any) => !s.is_all_shops && s.is_active !== false,
        );
        setShopNames(loaded.map((s) => s.name));
      })
      .catch(() => {});
  }, []);

  // Imported data per tab
  const [shopwiseImportRows, setShopwiseImportRows] = useState<
    ShopwiseWeeklyImportRow[] | undefined
  >();
  const [weeklyImportRows, setWeeklyImportRows] = useState<
    WeeklyImportRow[] | undefined
  >();
  const [monthlyImportRows, setMonthlyImportRows] = useState<
    MonthlyImportRow[] | undefined
  >();

  const handleImport = (data: ImportedData) => {
    if (data.type === "shopwise_week") setShopwiseImportRows(data.rows);
    else if (data.type === "weekly") setWeeklyImportRows(data.rows);
    else if (data.type === "monthly") setMonthlyImportRows(data.rows);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            Financial Reports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your financial declarations for different time periods.
          </p>
        </div>
        <div className="flex items-center gap-3 ml-auto">
          {/* Import Excel button */}
          {activeTab !== "month" && (
            <button
              type="button"
              onClick={() => setImportDialogOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-300 transition-colors"
            >
              <Upload size={13} />
              Import Excel
            </button>
          )}

          <Tabs
            options={[
              { label: "Shopwise weekly", value: "shopwise_week" },
              { label: "Weekly", value: "weekly" },
              { label: "Monthly", value: "month" },
              // { label: "Yearly", value: "year" },
            ]}
            activeTab={activeTab}
            onChange={(val) =>
              setActiveTab(val as "shopwise_week" | "month" | "year")
            }
          />
        </div>
      </div>

      <div className="pt-2">
        {/* Old card-based components – commented out, replaced by sheet views */}
        {/* {activeTab === "shopwise_week" && <ShopwiseWeeklyFinancialsUpload />} */}
        {/* {activeTab === "weekly" && <WeeklyFinancialsUpload />} */}
        {/* {activeTab === "month" && <MonthlyFinancialsUpload />} */}
        {/* {activeTab === "year" && <YearlyFinancialsUpload />} */}

        {/* New spreadsheet-style views */}
        {activeTab === "shopwise_week" && (
          <ShopwiseWeeklySheetView importedRows={shopwiseImportRows} />
        )}
        {activeTab === "weekly" && (
          <WeeklySheetView importedRows={weeklyImportRows} />
        )}
        {activeTab === "month" && (
          <MonthlySheetView importedRows={monthlyImportRows} />
        )}
      </div>

      {/* Excel Import Dialog — common, reads activeTab to know which sheet */}
      <ExcelImportDialog
        isOpen={importDialogOpen}
        activeTab={activeTab as "shopwise_week" | "weekly" | "month"}
        onClose={() => setImportDialogOpen(false)}
        onImport={handleImport}
        knownShopNames={shopNames}
      />
    </div>
  );
};

export default FinancialsUpload;
