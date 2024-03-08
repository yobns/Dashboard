import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../Context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { isUserLoggedIn } = useContext(AuthContext);
  return <div>{isUserLoggedIn ? children : <Navigate to="/login" />}</div>;
};

export default PrivateRoute;
