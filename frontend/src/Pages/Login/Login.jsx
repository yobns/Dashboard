import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { AuthContext } from "../../Context/AuthContext";
import LoginForm from "../../Components/LoginForm/LoginForm";

const Login = () => {
  const { isUserLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (isUserLoggedIn) navigate("/");
  }, [isUserLoggedIn, navigate]);

  return (
    <div className="loginContainer">
      <LoginForm />
    </div>
  );
};

export default Login;
