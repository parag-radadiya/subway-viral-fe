import { ROUTES } from "../../../utils/routes";
import RotaListContainer from "../../../components/rotas/RotaListContainer";

const RotaList = () => {
  return (
    <RotaListContainer
      title="Store Rotas"
      subtitle="Manage schedules and staff coverage for your shop"
      routes={{
        list: ROUTES.SUB_MANAGER.ROTAS.LIST,
        create: ROUTES.SUB_MANAGER.ROTAS.CREATE,
        edit: ROUTES.SUB_MANAGER.ROTAS.EDIT,
        details: ROUTES.SUB_MANAGER.ROTAS.DETAILS,
      }}
    />
  );
};

export default RotaList;
