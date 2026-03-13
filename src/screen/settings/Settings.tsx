import { Settings as SettingsIcon } from "lucide-react";
import { Card } from "../../components/common/Card";

const Settings = () => (
  <div className="max-w-7xl mx-auto space-y-6 animate-fade-in-up">
    <h1 className="text-2xl font-bold text-primary-900">Settings</h1>
    <Card>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <SettingsIcon size={40} className="text-slate-300 mb-3" />
        <p className="text-slate-500 font-medium">Settings coming soon</p>
        <p className="text-slate-400 text-sm mt-1">Phase 2 implementation</p>
      </div>
    </Card>
  </div>
);

export default Settings;
