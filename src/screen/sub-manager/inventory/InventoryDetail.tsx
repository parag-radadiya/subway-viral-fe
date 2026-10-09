import { ROUTES } from "../../../utils/routes";
import InventoryDetailContainer from "../../../components/inventory/InventoryDetailContainer";

const InventoryDetail = () => (
  <InventoryDetailContainer
    routes={{
      list: ROUTES.SUB_MANAGER.INVENTORY.LIST,
      edit: ROUTES.SUB_MANAGER.INVENTORY.EDIT,
      details: ROUTES.SUB_MANAGER.INVENTORY.DETAILS,
      query_details: ROUTES.SUB_MANAGER.INVENTORY.QUERY_DETAILS,
    }}
  />
);
export default InventoryDetail;
