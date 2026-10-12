import { ROUTES } from "../../../utils/routes";
import QueryDetailContainer from "../../../components/inventory/QueryDetailContainer";

const QueryDetail = () => (
  <QueryDetailContainer
    routes={{
      queries: ROUTES.MANAGER.INVENTORY.QUERIES,
      details: ROUTES.MANAGER.INVENTORY.DETAILS,
    }}
  />
);
export default QueryDetail;
