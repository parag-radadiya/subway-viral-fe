import { ROUTES } from "../../../utils/routes";
import RotaListContainer from "../../../components/rotas/RotaListContainer";

const RotaList = () => {
  return (
    <RotaListContainer
      title="Org-Wide Rotas"
      subtitle="Global oversight and management across all locations"
      routes={{
        list: ROUTES.ADMIN.ROTAS.LIST,
        create: ROUTES.ADMIN.ROTAS.CREATE,
        edit: ROUTES.ADMIN.ROTAS.EDIT,
        details: ROUTES.ADMIN.ROTAS.DETAILS,
      }}
    />
  );
};

export default RotaList;
