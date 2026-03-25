import { ROUTES } from "../../../utils/routes";
import RotaFormContainer from "../../../components/rotas/RotaFormContainer";

export default function RotaForm() {
  return <RotaFormContainer onSuccessRoute={ROUTES.ADMIN.ROTAS.LIST} />;
}
