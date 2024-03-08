import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./Pages/Login/Login";
import PrivateRoute from "./Components/PrivateRoute/PrivateRoute";
import { AuthProvider } from "./Context/AuthContext";
import Files from "./Pages/Files/Files";
import Dashboard from "./Components/Dashboard/Dashboard";
import Home from "./Pages/Home/Home";
import Account from "./Pages/Account/Account";
import Data from "./Pages/Data/Data";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          >
            <Route path="/" element={<Home />} />
            <Route path="/files" element={<Files />} />
            <Route path="/data" element={<Data />} />
            <Route path="/data/:fileName" element={<Data />} />
            <Route path="/account" element={<Account />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
