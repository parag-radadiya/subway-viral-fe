import { ROUTES } from "../../../utils/routes";
import RotaListContainer from "../../../components/rotas/RotaListContainer";

const RotaList = () => {
  return (
    <RotaListContainer
      title="Store Rotas"
      subtitle="Manage schedules and staff coverage for your shop"
      routes={{
        list: ROUTES.MANAGER.ROTAS.LIST,
        create: ROUTES.MANAGER.ROTAS.CREATE,
        edit: ROUTES.MANAGER.ROTAS.EDIT,
        details: ROUTES.MANAGER.ROTAS.DETAILS,
      }}
    />
  );
};

export default RotaList;
