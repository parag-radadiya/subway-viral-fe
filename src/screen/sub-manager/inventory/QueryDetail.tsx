import { ROUTES } from "../../../utils/routes";
import QueryDetailContainer from "../../../components/inventory/QueryDetailContainer";

const QueryDetail = () => (
  <QueryDetailContainer
    routes={{
      queries: ROUTES.SUB_MANAGER.INVENTORY.QUERIES,
      details: ROUTES.SUB_MANAGER.INVENTORY.DETAILS,
    }}
  />
);
export default QueryDetail;
