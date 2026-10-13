import { ROUTES } from "../../../utils/routes";
import UserListContainer from "../../../components/users/UserListContainer";

const UserList = () => (
  <UserListContainer
    role="manager"
    routes={{
      list: ROUTES.MANAGER.USERS.LIST,
      create: ROUTES.MANAGER.USERS.CREATE,
      edit: ROUTES.MANAGER.USERS.EDIT,
      details: ROUTES.MANAGER.USERS.DETAILS,
    }}
  />
);
export default UserList;
