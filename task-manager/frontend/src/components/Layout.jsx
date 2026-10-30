import { LogOut, ListTodo } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export default function Layout() {
  const { user, logout } = useAuth(),
    navigate = useNavigate();
  return (
    <div className="app-shell">
      <header className="topbar">
        <NavLink to="/" className="brand">
          <span className="brand-icon">
            <ListTodo />
          </span>{" "}
          TaskFlow
        </NavLink>
        <div className="topbar-user">
          <span>Hi, {user?.name?.split(" ")[0]}</span>
          <button
            className="icon-button"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
      <footer className="footer">
        TaskFlow · Organise your work, one task at a time.
      </footer>
    </div>
  );
}
