import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import * as paymentApi from "../api/payments";
import { formatPrice, ApiError } from "../api/client";
import type { Payment } from "../types/payment";

const PaymentReturnPage = () => {
  const [params] = useSearchParams();
  const reference = params.get("reference") ?? "";

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reference) {
      setError("Missing payment reference");
      setLoading(false);
      return;
    }

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const synced = await paymentApi
          .syncPayment(reference)
          .catch(() => null);
        if (synced) {
          setPayment(synced);
          return;
        }
        const p = await paymentApi.getPayment(reference);
        setPayment(p);
      } catch (e: unknown) {
        if (e instanceof ApiError) {
          setError(e.body?.message ?? e.message ?? "Failed to load payment");
        } else {
          setError("Failed to load payment");
        }
      } finally {
        setLoading(false);
      }
    };

    run().catch(() => undefined);
  }, [reference]);

  if (loading) return <p className="text-neutral-400">Loading payment…</p>;
  if (error)
    return (
      <div className="bg-red-900/40 border border-red-700 p-4 rounded-lg">
        <p className="text-red-200">{error}</p>
        <Link to="/" className="text-green-500 underline">
          Back to store
        </Link>
      </div>
    );

  if (!payment) return null;

  const statusColor =
    payment.status === "paid"
      ? "text-green-500"
      : payment.status === "open"
        ? "text-yellow-400"
        : "text-red-400";

  return (
    <div className="bg-neutral-800 p-6 rounded-lg flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Payment</h1>
      <p className="text-neutral-300">
        Reference: <span className="font-mono">{payment.reference}</span>
      </p>
      <p className={`text-xl font-semibold ${statusColor}`}>
        Status: {payment.status}
      </p>
      <p className="text-neutral-300">
        Total:{" "}
        <span className="font-semibold">
          {formatPrice(payment.amountCents)}
        </span>
      </p>

      <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-4">
        <p className="font-semibold mb-2">Items</p>
        <ul className="list-disc ml-6 text-neutral-300">
          {payment.items.map((it) => (
            <li key={it.albumId}>
              {it.title} — {it.artistName} ({formatPrice(it.priceCents)})
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-3">
        <Link
          to="/library"
          className="bg-green-600 hover:bg-green-500 text-neutral-900 font-bold px-4 py-2 rounded-lg"
        >
          Go to library
        </Link>
        <Link
          to="/"
          className="bg-neutral-900 border border-neutral-700 px-4 py-2 rounded-lg"
        >
          Back to store
        </Link>
      </div>

      {payment.status !== "paid" && (
        <p className="text-neutral-400">
          Als je net hebt betaald, kan de status even duren. Herlaad deze pagina
          of klik sync opnieuw.
        </p>
      )}
    </div>
  );
};

export default PaymentReturnPage;