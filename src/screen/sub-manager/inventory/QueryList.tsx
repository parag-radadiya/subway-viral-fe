import { ROUTES } from "../../../utils/routes";
import QueryListContainer from "../../../components/inventory/QueryListContainer";

const QueryList = () => (
  <QueryListContainer
    routes={{
      list: ROUTES.SUB_MANAGER.INVENTORY.LIST,
      query_details: ROUTES.SUB_MANAGER.INVENTORY.QUERY_DETAILS,
    }}
  />
);
export default QueryList;
