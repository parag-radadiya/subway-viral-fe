import { useNavigate } from "react-router-dom";
import AttendancePunchCard from "../attendance/AttendancePunchCard";
import ManualPunchInForm from "./ManualPunchInForm";
import Tabs from "../common/Tabs";
import { useAppSelector } from "../../store";
import { useState } from "react";

interface PunchInContainerProps {
  onSuccessRoute: string;
}

const PunchInContainer = ({ onSuccessRoute }: PunchInContainerProps) => {
  const navigate = useNavigate();
  const { user } = useAppSelector((s) => s.auth);
  const [activeTab, setActiveTab] = useState("personal");

  const canManualPunch = user?.role?.permissions?.can_manual_punch;

  const handleSuccess = () => {
    navigate(onSuccessRoute);
  };

  return (
    <div className="max-w-2xl mx-auto pt-8 px-4 pb-20">
      {canManualPunch && (
        <div className="flex justify-center mb-8">
          <Tabs
            activeTab={activeTab}
            onChange={setActiveTab}
            options={[
              { label: "My Punch", value: "personal" },
              { label: "Staff Manual", value: "manual" },
            ]}
          />
        </div>
      )}

      {activeTab === "personal" ? (
        <AttendancePunchCard onSuccess={handleSuccess} />
      ) : (
        <div className="max-w-md mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-8 animate-fade-in">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800">
              Staff Manual Entry
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Select staff and shop to record a manual punch-in
            </p>
          </div>
          <ManualPunchInForm onSuccess={handleSuccess} />
        </div>
      )}
    </div>
  );
};

export default PunchInContainer;
