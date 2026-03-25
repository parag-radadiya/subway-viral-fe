import { ROUTES } from "../../../utils/routes";
import RotaFormContainer from "../../../components/rotas/RotaFormContainer";

export default function RotaForm() {
  return <RotaFormContainer onSuccessRoute={ROUTES.SUB_MANAGER.ROTAS.LIST} />;
}
