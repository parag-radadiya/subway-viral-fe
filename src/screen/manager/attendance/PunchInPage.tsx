import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../utils/routes";
import AttendancePunchCard from "../../../components/attendance/AttendancePunchCard";

const ManagerPunchInPage = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate(ROUTES.MANAGER.ATTENDANCE);
  };

  return <AttendancePunchCard onSuccess={handleSuccess} />;
};

export default ManagerPunchInPage;
