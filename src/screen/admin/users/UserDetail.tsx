import { ROUTES } from "../../../utils/routes";
import UserDetailContainer from "../../../components/users/UserDetailContainer";

const UserDetail = () => (
  <UserDetailContainer
    routes={{
      list: ROUTES.ADMIN.USERS.LIST,
      edit: ROUTES.ADMIN.USERS.EDIT,
      shopDetails: ROUTES.ADMIN.SHOPS.DETAILS,
    }}
  />
);
export default UserDetail;
