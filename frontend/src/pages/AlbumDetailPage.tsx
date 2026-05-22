import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { Album } from "../types/album";
import * as albumApi from "../api/albums";
import { formatPrice, resolveImageUrl } from "../api/client";
import { useCart } from "../contexts/CartContext";
import { ApiError } from "../api/client";

const AlbumDetailPage = () => {
  const { id } = useParams();
  const albumId = Number(id);
  const { add } = useCart();

  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!albumId) return;
    setLoading(true);
    setError(null);

    albumApi
      .fetchCatalogAlbumById(albumId)
      .then(setAlbum)
   .catch((e: unknown) => { 
        if (e instanceof ApiError) {
          setError(e.body?.message ?? e.message ?? "Failed to load album");
        } else if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("Failed to load album");
        }
      })
      .finally(() => setLoading(false));
  }, [albumId]);

  if (loading) return <p className="text-neutral-400">Loading…</p>;
  if (error)
    return (
      <div className="bg-red-900/40 border border-red-700 p-4 rounded-lg">
        <p className="text-red-200">{error}</p>
        <Link to="/" className="text-green-500 underline">
          Back to store
        </Link>
      </div>
    );
  if (!album) return null;

  const cover = resolveImageUrl(album.coverImageUrl);

  return (
    <div className="bg-neutral-800 p-6 rounded-lg flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-1/3">
        {cover ? (
          <img src={cover} alt={album.title} className="rounded-lg w-full object-cover" />
        ) : (
          <div className="rounded-lg bg-neutral-900 w-full h-72 flex items-center justify-center text-neutral-500">
            No cover
          </div>
        )}
      </div>

      <div className="flex-1">
        <h1 className="text-3xl font-bold">{album.title}</h1>
        <p className="text-neutral-300 mt-1">{album.artist?.name}</p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-neutral-300">
          <p>
            <span className="text-neutral-500">Released:</span>{" "}
            {new Date(album.dateReleased).toLocaleDateString()}
          </p>
          <p>
            <span className="text-neutral-500">Tracks:</span> {album.trackCount ?? "—"}
          </p>
          <p>
            <span className="text-neutral-500">Length:</span> {album.lengthSeconds ?? "—"} sec
          </p>
          <p>
            <span className="text-neutral-500">Price:</span>{" "}
            <span className="font-semibold text-neutral-50">{formatPrice(album.priceCents)}</span>
          </p>
        </div>

        <div className="mt-6 flex gap-3 items-center">
          {album.isOwned ? (
            <span className="text-green-500 font-semibold">Owned</span>
          ) : (
            <button
              onClick={() => add(album)}
              className="bg-green-600 hover:bg-green-500 text-neutral-900 font-bold px-6 py-3 rounded-lg transition"
            >
              Add to cart
            </button>
          )}
          <Link to="/" className="text-neutral-300 hover:text-green-500">
            Back to store
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AlbumDetailPage;
