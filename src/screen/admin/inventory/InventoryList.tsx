import { ROUTES } from "../../../utils/routes";
import InventoryListContainer from "../../../components/inventory/InventoryListContainer";

const InventoryList = () => (
  <InventoryListContainer
    routes={{
      list: ROUTES.ADMIN.INVENTORY.LIST,
      create: ROUTES.ADMIN.INVENTORY.CREATE,
      edit: ROUTES.ADMIN.INVENTORY.EDIT,
      details: ROUTES.ADMIN.INVENTORY.DETAILS,
      queries: ROUTES.ADMIN.INVENTORY.QUERIES,
    }}
  />
);
export default InventoryList;
