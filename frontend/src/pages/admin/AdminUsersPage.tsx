import { useEffect, useState } from "react";
import type { PublicUser, Role } from "../../types/user";
import * as usersApi from "../../api/users";
import { ApiError } from "../../api/client";

const AdminUsersPage = () => {
  const [items, setItems] = useState<PublicUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await usersApi.fetchUsers();
      setItems(res.items);
    } catch (e: unknown) {
      if (e instanceof ApiError) {
        setError(e.body?.message ?? e.message ?? "gebruikers konden niet geladen worden");
      } else {
        setError("gebruikers konden niet geladen worden");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load().catch(() => undefined); }, []);

  const setRole = async (userId: number, role: Role) => {
    await usersApi.updateUserRole(userId, role);
    await load();
  };

  const doDelete = async (userId: number) => {
    if (!confirm("Delete this user?")) return;
    await usersApi.deleteUser(userId);
    await load();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gebruikers</h1>
        <button onClick={load} className="bg-neutral-900 border border-neutral-700 px-4 py-2 rounded-lg">
          Herladen
        </button>
      </div>

      {loading && <p className="text-neutral-400">Loading…</p>}
      {error && (
        <div className="bg-red-900/40 border border-red-700 p-4 rounded-lg">
          <p className="text-red-200">{error}</p>
        </div>
      )}

      <div className="bg-neutral-800 rounded-lg overflow-hidden border border-neutral-700">
        {items.map((u) => (
          <div key={u.id} className="flex items-center gap-4 p-4 border-b border-neutral-700 last:border-b-0">
            <div className="flex-1">
              <p className="font-semibold">{u.firstName} {u.lastName}</p>
              <p className="text-sm text-neutral-400">{u.email}</p>
            </div>

            <select
              value={u.role}
              onChange={(e) => setRole(u.id, e.target.value as Role)}
              className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2"
            >
              <option value="user">Gebruiker</option>
              <option value="admin">Admin</option>
            </select>

            <button onClick={() => doDelete(u.id)} className="bg-neutral-900 border border-neutral-700 px-3 py-2 rounded-lg hover:border-red-500 hover:text-red-300">
              Verwijderen
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminUsersPage;
