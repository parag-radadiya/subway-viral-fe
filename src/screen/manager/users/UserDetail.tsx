import { ROUTES } from "../../../utils/routes";
import UserDetailContainer from "../../../components/users/UserDetailContainer";

const UserDetail = () => (
  <UserDetailContainer
    routes={{
      list: ROUTES.MANAGER.USERS.LIST,
      edit: ROUTES.MANAGER.USERS.EDIT,
      shopDetails: ((id: string) => `/manager/shops/${id}`),
    }}
  />
);
export default UserDetail;
