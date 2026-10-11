import { ROUTES } from "../../../utils/routes";
import UserFormContainer from "../../../components/users/UserFormContainer";

const UserForm = () => (
  <UserFormContainer
    routes={{
      list: ROUTES.ADMIN.USERS.LIST,
    }}
  />
);
export default UserForm;
