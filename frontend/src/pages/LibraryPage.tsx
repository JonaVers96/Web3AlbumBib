import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import * as albumApi from "../api/albums";
import type { Album } from "../types/album";
import { resolveImageUrl } from "../api/client";

const LibraryPage = () => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await albumApi.fetchOwnedAlbums();
      setItems(res.items);
    } catch (e: any) {
      setError(e?.body?.message ?? e?.message ?? "Failed to load library");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    load().catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="bg-neutral-800 p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">Library</h1>
        <p className="text-neutral-300">Login om je aangekochte albums te zien.</p>
        <Link to="/login?next=/library" className="text-green-500 underline">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Library</h1>
        <button onClick={load} className="bg-neutral-900 border border-neutral-700 px-4 py-2 rounded-lg">
          Refresh
        </button>
      </div>

      {loading && <p className="text-neutral-400">Loading…</p>}
      {error && (
        <div className="bg-red-900/40 border border-red-700 p-4 rounded-lg">
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="bg-neutral-800 p-6 rounded-lg">
          <p className="text-neutral-300">Nog geen albums gekocht.</p>
          <Link to="/" className="text-green-500 underline">
            Naar de store
          </Link>
        </div>
      )}

      <div className="bg-neutral-800 rounded-lg overflow-hidden border border-neutral-700">
        {items.map((a) => (
          <div key={a.id} className="flex items-center gap-4 p-4 border-b border-neutral-700 last:border-b-0">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-neutral-900 flex-shrink-0">
              {a.coverImageUrl ? (
                <img src={resolveImageUrl(a.coverImageUrl)} alt={a.title} className="w-full h-full object-cover" />
              ) : null}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{a.title}</p>
              <p className="text-sm text-neutral-400">{a.artist?.name}</p>
            </div>
            <Link to={`/albums/${a.id}`} className="text-green-500 underline">
              View
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LibraryPage;
