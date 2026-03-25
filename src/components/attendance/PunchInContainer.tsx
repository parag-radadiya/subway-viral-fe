import { useNavigate } from "react-router-dom";
import AttendancePunchCard from "../attendance/AttendancePunchCard";

interface PunchInContainerProps {
  onSuccessRoute: string;
}

const PunchInContainer = ({ onSuccessRoute }: PunchInContainerProps) => {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto pt-8">
      <AttendancePunchCard onSuccess={() => navigate(onSuccessRoute)} />
    </div>
  );
};

export default PunchInContainer;
