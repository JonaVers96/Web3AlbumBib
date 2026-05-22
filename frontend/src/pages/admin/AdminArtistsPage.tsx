import { useEffect, useMemo, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import type { Artist, ArtistDetail } from "../../types/artist";
import * as artistApi from "../../api/artists";
import { ApiError } from "../../api/client";

type ArtistForm = { name: string; genre: string };

const AdminArtistsPage = () => {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [artists, setArtists] = useState<Artist[]>([]);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<ArtistDetail | null>(null);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<ArtistForm>({
    defaultValues: { name: "", genre: "" },
  });

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await artistApi.fetchArtists({ page, pageSize, q: q.trim() || undefined });
      setArtists(res.items);
      setTotal(res.total);
    } catch (e: unknown) {
      if (e instanceof ApiError) {
        setError(e.body?.message ?? e.message ?? "Failed to load artists");
      } else {
        setError("Failed to load artists");
      }
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, q]);

  useEffect(() => { load().catch(() => undefined); }, [load]);

  const startCreate = () => {
    setEditing(null);
    reset({ name: "", genre: "" });
  };

  const startEdit = async (a: Artist) => {
    const detail = await artistApi.fetchArtistById(a.id);
    setEditing(detail);
    reset({ name: detail.name, genre: detail.genre ?? "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit = async (values: ArtistForm) => {
    const body = { name: values.name, genre: values.genre.trim() ? values.genre : null };

    if (editing) {
      await artistApi.updateArtist(editing.id, body);
    } else {
      await artistApi.createArtist(body);
    }
    await load();
    startCreate();
  };

  const doDelete = async (id: number) => {
    if (!confirm("Delete this artist?")) return;
    await artistApi.deleteArtist(id);
    await load();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-neutral-800 p-6 rounded-lg">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-3xl font-bold">{editing ? "Edit artist" : "Create artist"}</h1>
          <button onClick={startCreate} className="bg-neutral-900 border border-neutral-700 px-4 py-2 rounded-lg">
            New
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-neutral-300">Name</label>
            <input className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2" {...register("name", { required: true })} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-neutral-300">Genre</label>
            <input className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2" {...register("genre")} />
          </div>
          <div className="md:col-span-2 flex gap-2">
            <button disabled={isSubmitting} className="bg-green-600 hover:bg-green-500 text-neutral-900 font-bold px-6 py-3 rounded-lg disabled:opacity-50">
              {isSubmitting ? "Saving…" : "Save"}
            </button>
            {editing && (
              <button type="button" onClick={startCreate} className="bg-neutral-900 border border-neutral-700 px-4 py-2 rounded-lg">
                Cancel
              </button>
            )}
          </div>
        </form>

        {editing && (
          <p className="text-neutral-400 mt-2">
            Albums gekoppeld: <span className="font-semibold">{editing.albumCount}</span>
          </p>
        )}
      </div>

      <div className="bg-neutral-800 p-4 rounded-lg flex flex-col md:flex-row gap-4 items-center justify-between">
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          placeholder="Search artists…"
          className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 w-full md:w-80"
        />

        <div className="flex gap-2 items-center">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="bg-neutral-900 border border-neutral-700 px-4 py-2 rounded-lg disabled:opacity-50">
            Prev
          </button>
          <p className="text-neutral-300">
            Page <span className="font-semibold text-neutral-50">{page}</span> / {totalPages}
          </p>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="bg-neutral-900 border border-neutral-700 px-4 py-2 rounded-lg disabled:opacity-50">
            Next
          </button>
        </div>
      </div>

      {loading && <p className="text-neutral-400">Loading…</p>}
      {error && (
        <div className="bg-red-900/40 border border-red-700 p-4 rounded-lg">
          <p className="text-red-200">{error}</p>
        </div>
      )}

      <div className="bg-neutral-800 rounded-lg overflow-hidden border border-neutral-700">
        {artists.map((a) => (
          <div key={a.id} className="flex items-center gap-4 p-4 border-b border-neutral-700 last:border-b-0">
            <div className="flex-1">
              <p className="font-semibold">{a.name}</p>
              <p className="text-sm text-neutral-400">{a.genre ?? "—"}</p>
            </div>
            <button onClick={() => startEdit(a)} className="bg-neutral-900 border border-neutral-700 px-3 py-2 rounded-lg hover:border-green-500">
              Edit
            </button>
            <button onClick={() => doDelete(a.id)} className="bg-neutral-900 border border-neutral-700 px-3 py-2 rounded-lg hover:border-red-500 hover:text-red-300">
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminArtistsPage;
