import React, { useState } from "react";
import Tabs from "../../../components/common/Tabs";
import ShopwiseWeeklySheetView from "./ShopwiseWeeklySheetView";
import WeeklySheetView from "./WeeklySheetView";
import MonthlySheetView from "./MonthlySheetView";
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
        <div className="ml-auto">
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
        {activeTab === "shopwise_week" && <ShopwiseWeeklySheetView />}
        {activeTab === "weekly" && <WeeklySheetView />}
        {activeTab === "month" && <MonthlySheetView />}
      </div>
    </div>
  );
};

export default FinancialsUpload;
