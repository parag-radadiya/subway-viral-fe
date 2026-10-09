import { ROUTES } from "../../../utils/routes";
import InventoryListContainer from "../../../components/inventory/InventoryListContainer";

const InventoryList = () => (
  <InventoryListContainer
    routes={{
      list: ROUTES.SUB_MANAGER.INVENTORY.LIST,
      create: ROUTES.SUB_MANAGER.INVENTORY.CREATE,
      edit: ROUTES.SUB_MANAGER.INVENTORY.EDIT,
      details: ROUTES.SUB_MANAGER.INVENTORY.DETAILS,
      queries: ROUTES.SUB_MANAGER.INVENTORY.QUERIES,
    }}
  />
);
export default InventoryList;
