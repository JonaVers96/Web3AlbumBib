import { NavLink, Link } from "react-router-dom";
import { MdOutlineQueueMusic } from "react-icons/md";
import { FaShoppingCart } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

const Header = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { count } = useCart();

  const linkClass =
    ({ isActive }: { isActive: boolean }) =>
      `font-semibold text-lg px-4 py-2 rounded-lg ${
        isActive ? "text-green-500" : "text-neutral-50"
      }`;

  return (
    <nav className="py-6 px-4 flex items-center justify-between border-b border-neutral-800">
      <Link
        to={"/"}
        className="text-green-500 font-bold text-3xl py-2 px-4 tracking-tight">
        Album Store
      </Link>

      <div className="flex gap-2 items-center">
        <NavLink to={"/"} className={linkClass} end>
          Store
        </NavLink>

        <NavLink to={"/library"} className={linkClass}>
          <div className="flex gap-2 items-center">
            <MdOutlineQueueMusic className="text-3xl" />
            <p>Bibliotheek</p>
          </div>
        </NavLink>

        {isAdmin && (
          <NavLink to={"/admin"} className={linkClass}>
            Admin
          </NavLink>
        )}

        <NavLink to={"/cart"} className={linkClass}>
          <div className="flex gap-2 items-center">
            <FaShoppingCart className="text-2xl" />
            <p>Winkelmandje ({count})</p>
          </div>
        </NavLink>

        {!isAuthenticated ? (
          <NavLink to={"/login"} className={linkClass}>
            Log in
          </NavLink>
        ) : (
          <button
            onClick={logout}
            className="font-semibold text-lg px-4 py-2 rounded-lg text-neutral-50 hover:text-green-500">
            Log uit ({user?.firstName})
          </button>
        )}
      </div>
    </nav>
  );
};

export default Header;
