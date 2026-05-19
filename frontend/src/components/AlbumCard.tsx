import { Link } from "react-router-dom";
import type { Album } from "../types/album";
import { formatPrice, resolveImageUrl } from "../api/client";
import { useCart } from "../contexts/CartContext";

const AlbumCard = ({ album }: { album: Album }) => {
  const { add } = useCart();
  const cover = resolveImageUrl(album.coverImageUrl);

  return (
    <div className="bg-neutral-800 p-4 rounded-lg flex flex-col items-center hover:bg-neutral-700 transition duration-200">
      <Link to={`/albums/${album.id}`} className="w-full">
        <h2 className="text-xl font-semibold text-center">{album.title}</h2>
        <p className="text-sm text-neutral-400 text-center">{album.artist?.name}</p>

        <div className="mt-4 w-full flex justify-center">
          {cover ? (
            <img src={cover} alt={album.title} className="rounded-lg max-h-52 object-cover" />
          ) : (
            <div className="rounded-lg bg-neutral-900 w-full h-52 flex items-center justify-center text-neutral-500">
              No cover
            </div>
          )}
        </div>
      </Link>

      <div className="w-full flex items-center justify-between mt-4">
        <p className="font-semibold">{formatPrice(album.priceCents)}</p>

        {album.isOwned ? (
          <span className="text-green-500 font-semibold">Owned</span>
        ) : (
          <button
            onClick={() => add(album)}
            className="bg-green-600 hover:bg-green-500 text-neutral-900 font-bold px-4 py-2 rounded-lg transition">
            Add
          </button>
        )}
      </div>
    </div>
  );
};

export default AlbumCard;
