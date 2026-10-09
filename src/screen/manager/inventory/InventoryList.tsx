import { ROUTES } from "../../../utils/routes";
import InventoryListContainer from "../../../components/inventory/InventoryListContainer";

const InventoryList = () => (
  <InventoryListContainer
    routes={{
      list: ROUTES.MANAGER.INVENTORY.LIST,
      create: ROUTES.MANAGER.INVENTORY.CREATE,
      edit: ROUTES.MANAGER.INVENTORY.EDIT,
      details: ROUTES.MANAGER.INVENTORY.DETAILS,
      queries: ROUTES.MANAGER.INVENTORY.QUERIES,
    }}
  />
);
export default InventoryList;
