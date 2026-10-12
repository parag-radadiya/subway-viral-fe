import { ROUTES } from "../../../utils/routes";
import QueryDetailContainer from "../../../components/inventory/QueryDetailContainer";

const QueryDetail = () => (
  <QueryDetailContainer
    routes={{
      queries: ROUTES.ADMIN.INVENTORY.QUERIES,
      details: ROUTES.ADMIN.INVENTORY.DETAILS,
    }}
  />
);
export default QueryDetail;
