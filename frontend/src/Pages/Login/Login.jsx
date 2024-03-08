import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { AuthContext } from "../../Context/AuthContext";

const Login = () => {
  const { isUserLoggedIn, LoginForm } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (isUserLoggedIn) navigate("/");
  }, [isUserLoggedIn, navigate]);

  return <div className="loginContainer">{LoginForm}</div>;
};

export default Login;
