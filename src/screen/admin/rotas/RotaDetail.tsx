import { ROUTES } from "../../../utils/routes";
import RotaDetailContainer from "../../../components/rotas/RotaDetailContainer";

const RotaDetail = () => {
  return (
    <RotaDetailContainer
      routes={{
        list: ROUTES.ADMIN.ROTAS.LIST,
        edit: ROUTES.ADMIN.ROTAS.EDIT,
      }}
    />
  );
};

export default RotaDetail;
