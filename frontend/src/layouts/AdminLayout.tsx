import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
  const linkClass =
    ({ isActive }: { isActive: boolean }) =>
      `font-semibold px-4 py-2 rounded-lg transition-colors ${
        isActive ? "bg-green-600 text-neutral-900" : "bg-neutral-800 text-neutral-50 hover:bg-neutral-700"
      }`;

const AdminLayout = () => {
  const { isAdmin, loading } = useAuth();
  if (loading) {
    return <p className="text-neutral-400 p-6">Bezig met laden van admin rechten...</p>;
  }
  if (!isAdmin) {
    return (
      <div className="bg-neutral-800 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">Admin</h2>
        <p className="text-neutral-300">Je hebt geen toegang tot dit deel.</p>
      </div>
    );
  }

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
          Artisten
        </NavLink>
        <NavLink to={"/admin/users"} className={linkClass}>
          Gebruikers
        </NavLink>
      </div>
      <Outlet />
    </div>
  );
};

export default AdminLayout;
