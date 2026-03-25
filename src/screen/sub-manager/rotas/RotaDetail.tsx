import { ROUTES } from "../../../utils/routes";
import RotaDetailContainer from "../../../components/rotas/RotaDetailContainer";

const RotaDetail = () => {
  return (
    <RotaDetailContainer
      routes={{
        list: ROUTES.SUB_MANAGER.ROTAS.LIST,
        edit: ROUTES.SUB_MANAGER.ROTAS.EDIT,
      }}
    />
  );
};

export default RotaDetail;
