import { ROUTES } from "../../../utils/routes";
import InventoryDetailContainer from "../../../components/inventory/InventoryDetailContainer";

const InventoryDetail = () => (
  <InventoryDetailContainer
    routes={{
      list: ROUTES.MANAGER.INVENTORY.LIST,
      edit: ROUTES.MANAGER.INVENTORY.EDIT,
      details: ROUTES.MANAGER.INVENTORY.DETAILS,
      query_details: ROUTES.MANAGER.INVENTORY.QUERY_DETAILS,
    }}
  />
);
export default InventoryDetail;
