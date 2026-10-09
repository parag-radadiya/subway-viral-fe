import { ROUTES } from "../../../utils/routes";
import InventoryFormContainer from "../../../components/inventory/InventoryFormContainer";

const InventoryForm = () => (
  <InventoryFormContainer
    routes={{ list: ROUTES.ADMIN.INVENTORY.LIST }}
  />
);
export default InventoryForm;
