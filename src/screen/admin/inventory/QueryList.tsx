import { ROUTES } from "../../../utils/routes";
import QueryListContainer from "../../../components/inventory/QueryListContainer";

const QueryList = () => (
  <QueryListContainer
    routes={{
      list: ROUTES.ADMIN.INVENTORY.LIST,
      query_details: ROUTES.ADMIN.INVENTORY.QUERY_DETAILS,
    }}
  />
);
export default QueryList;
