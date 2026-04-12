import { Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/common/Button";
import { ROUTES } from "../../../utils/routes";
import { MonthlyFinancialView } from "./components/MonthlyFinancialView";
import { WeeklyFinancialView } from "./components/WeeklyFinancialView";

type ReportType = "weekly_financial" | "monthly_store_kpi";

const TABS: { label: string; value: ReportType }[] = [
  { label: "Weekly", value: "weekly_financial" },
  { label: "Monthly", value: "monthly_store_kpi" },
];

const FinancialsList = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ReportType>("weekly_financial");

  return (
    <div className="">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Financial</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage and view your financial data.
          </p>
        </div>
        <div className="flex gap-4 items-center">
          {/* Tab switcher */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
            {TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.value
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Button onClick={() => navigate(ROUTES.ADMIN.FINANCIALS.UPLOAD)}>
            <Plus size={18} />
            Add Record
          </Button>
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "weekly_financial" ? (
        <WeeklyFinancialView />
      ) : (
        <MonthlyFinancialView />
      )}
    </div>
  );
};

export default FinancialsList;
