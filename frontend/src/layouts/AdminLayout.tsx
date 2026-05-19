import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const AdminLayout = () => {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <div className="bg-neutral-800 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">Admin</h2>
        <p className="text-neutral-300">Je hebt geen toegang tot dit deel.</p>
      </div>
    );
  }

  const linkClass =
    ({ isActive }: { isActive: boolean }) =>
      `font-semibold px-4 py-2 rounded-lg ${
        isActive ? "bg-green-600 text-neutral-900" : "bg-neutral-800 text-neutral-50"
      }`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2 flex-wrap">
        <NavLink to={"/admin"} className={linkClass} end>
          Overzicht
        </NavLink>
        <NavLink to={"/admin/albums"} className={linkClass}>
          Albums
        </NavLink>
        <NavLink to={"/admin/artists"} className={linkClass}>
          Artists
        </NavLink>
        <NavLink to={"/admin/users"} className={linkClass}>
          Users
        </NavLink>
      </div>
      <Outlet />
    </div>
  );
};

export default AdminLayout;
