import { ROUTES } from "../../../utils/routes";
import UserListContainer from "../../../components/users/UserListContainer";

const UserList = () => (
  <UserListContainer
    role="admin"
    routes={{
      list: ROUTES.ADMIN.USERS.LIST,
      create: ROUTES.ADMIN.USERS.CREATE,
      edit: ROUTES.ADMIN.USERS.EDIT,
      details: ROUTES.ADMIN.USERS.DETAILS,
    }}
  />
);
export default UserList;
