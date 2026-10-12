import { ROUTES } from "../../../utils/routes";
import InventoryDetailContainer from "../../../components/inventory/InventoryDetailContainer";

const InventoryDetail = () => (
  <InventoryDetailContainer
    routes={{
      list: ROUTES.ADMIN.INVENTORY.LIST,
      edit: ROUTES.ADMIN.INVENTORY.EDIT,
      details: ROUTES.ADMIN.INVENTORY.DETAILS,
      query_details: ROUTES.ADMIN.INVENTORY.QUERY_DETAILS,
    }}
  />
);
export default InventoryDetail;
