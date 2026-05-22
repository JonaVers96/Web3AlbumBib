import { useEffect, useMemo, useState } from "react";
import AlbumCard from "../components/AlbumCard";
import * as albumApi from "../api/albums";
import * as artistApi from "../api/artists";
import type { Album } from "../types/album";
import type { Artist } from "../types/artist";
import { ApiError } from "../api/client";

const StorePage = () => {
  const [q, setQ] = useState("");
  const [artistId, setArtistId] = useState<number | "">("");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [albums, setAlbums] = useState<Album[]>([]);
  const [total, setTotal] = useState(0);
  const pageSize = 12;

  const [artists, setArtists] = useState<Artist[]>([]);

  useEffect(() => {
    artistApi
      .fetchArtists({ page: 1, pageSize: 100 })
      .then((res) => setArtists(res.items))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
    setLoading(true);
    setError(null);
    albumApi
      .fetchCatalogAlbums({ page, pageSize, q: q.trim() || undefined, artistId })
      .then((res) => {
        setAlbums(res.items);
        setTotal(res.total);
      })
       .catch((e: unknown) => {
        if (e instanceof ApiError) {
          setError(e.body?.message ?? e.message ?? "Kan catalogus niet laden");
        } else if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("Kan catalogus niet laden");
        }
      })     .finally(() => setLoading(false));
  }, 400);
  return () => clearTimeout(delayDebounceFn);
},[page, q, artistId]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total]);

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-neutral-800 p-4 rounded-lg flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 w-full md:w-auto">
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Zoek titel of artiest..."
            className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 w-full md:w-80"
          />
          <select
            value={artistId}
            onChange={(e) => {
              const v = e.target.value;
              setArtistId(v ? Number(v) : "");
              setPage(1);
            }}
            className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2"
          >
            <option value="">Alle artiesten</option>
            {artists.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 items-center">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="bg-neutral-900 border border-neutral-700 px-4 py-2 rounded-lg disabled:opacity-50"
          >
            Vorige
          </button>
          <p className="text-neutral-300">
            Pagina <span className="font-semibold text-neutral-50">{page}</span> / {totalPages}
          </p>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="bg-neutral-900 border border-neutral-700 px-4 py-2 rounded-lg disabled:opacity-50"
          >
            Volgende
          </button>
        </div>
      </div>

      {loading && <p className="text-neutral-400">Albums laden…</p>}
      {error && (
        <div className="bg-red-900/40 border border-red-700 p-4 rounded-lg">
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {!loading && !error && albums.length === 0 && (
        <div className="bg-neutral-800 p-6 rounded-lg">
          <p className="text-neutral-300">Geen albums gevonden.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {albums.map((album) => (
          <AlbumCard key={album.id} album={album} />
        ))}
      </div>
    </div>
  );
};

export default StorePage;
