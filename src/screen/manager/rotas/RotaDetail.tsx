import { ROUTES } from "../../../utils/routes";
import RotaDetailContainer from "../../../components/rotas/RotaDetailContainer";

const RotaDetail = () => {
  return (
    <RotaDetailContainer
      routes={{
        list: ROUTES.MANAGER.ROTAS.LIST,
        edit: ROUTES.MANAGER.ROTAS.EDIT,
      }}
    />
  );
};

export default RotaDetail;
