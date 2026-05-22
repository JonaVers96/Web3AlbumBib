import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatPrice, resolveImageUrl } from "../api/client";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import * as paymentApi from "../api/payments";
import { ApiError } from "../api/client";

const CartPage = () => {
  const { isAuthenticated } = useAuth();
  const { items, remove, totalCents, clear } = useCart();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const albumIds = useMemo(() => items.map((a) => a.id), [items]);

  const checkout = async () => {
    if (!isAuthenticated) {
      navigate("/login?next=/cart");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { checkoutUrl } = await paymentApi.createCheckout(albumIds);
      window.location.href = checkoutUrl;
    } catch (e: unknown) {
      if (e instanceof ApiError) {
        setError(e.body?.message ?? e.message ?? "Het afrekenen is mislukt");
      } else {
        setError("Het afrekenen is mislukt");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Cart</h1>

      {items.length === 0 ? (
        <div className="bg-neutral-800 p-6 rounded-lg">
          <p className="text-neutral-300">Je winkelmandje is leeg.</p>
          <Link to="/" className="text-green-500 underline">
            Ga naar de store
          </Link>
        </div>
      ) : (
        <>
          {error && (
            <div className="bg-red-900/40 border border-red-700 p-4 rounded-lg">
              <p className="text-red-200">{error}</p>
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
                <p className="font-semibold">{formatPrice(a.priceCents)}</p>
                <button
                  onClick={() => remove(a.id)}
                  className="bg-neutral-900 border border-neutral-700 px-3 py-2 rounded-lg hover:border-red-500 hover:text-red-300"
                >
                  Verwijderen
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between bg-neutral-800 p-4 rounded-lg">
            <p className="text-xl font-bold">Total: {formatPrice(totalCents)}</p>
            <div className="flex gap-2">
              <button
                onClick={clear}
                className="bg-neutral-900 border border-neutral-700 px-4 py-2 rounded-lg"
              >
                Winkelmandje legen
              </button>
              <button
                onClick={checkout}
                disabled={loading}
                className="bg-green-600 hover:bg-green-500 text-neutral-900 font-bold px-6 py-3 rounded-lg transition disabled:opacity-50"
              >
                {loading ? "Omleiding…" : "Betalen (Mollie)"}
              </button>
            </div>
          </div>

          {!isAuthenticated && (
            <p className="text-neutral-400">
              Je moet inloggen om af te rekenen. <Link to="/login" className="text-green-500 underline">Inloggen</Link>
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default CartPage;
