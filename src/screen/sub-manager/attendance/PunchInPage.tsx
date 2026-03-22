import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../utils/routes";
import AttendancePunchCard from "../../../components/attendance/AttendancePunchCard";

const SubManagerPunchInPage = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate(ROUTES.SUB_MANAGER.ATTENDANCE);
  };

  return <AttendancePunchCard onSuccess={handleSuccess} />;
};

export default SubManagerPunchInPage;
