import { ROUTES } from "../../../utils/routes";
import PunchInContainer from "../../../components/attendance/PunchInContainer";

const PunchInPage = () => {
  return <PunchInContainer onSuccessRoute={ROUTES.MANAGER.DASHBOARD} />;
};

export default PunchInPage;
