import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import type { Album } from "../../types/album";
import type { Artist } from "../../types/artist";
import { formatPrice, resolveImageUrl, ApiError } from "../../api/client"; // ⬅️ ApiError toegevoegd
import * as albumApi from "../../api/albums";
import * as artistApi from "../../api/artists";
import * as uploadApi from "../../api/uploads";

type AlbumForm = {
  title: string;
  artistId: number;
  dateReleased: string;
  trackCount: number | null;
  lengthSeconds: number | null;
  priceCents: number;
  coverImageUrl: string | null;
};

const AdminAlbumsPage = () => {
  const [q, setQ] = useState("");
  const [artistId, setArtistId] = useState<number | "">("");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const [albums, setAlbums] = useState<Album[]>([]);
  const [total, setTotal] = useState(0);
  const [artists, setArtists] = useState<Artist[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<Album | null>(null);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, setValue, reset, watch, formState: { isSubmitting } } = useForm<AlbumForm>({
    defaultValues: {
      title: "",
      artistId: 0,
      dateReleased: new Date().toISOString().slice(0, 10),
      trackCount: null,
      lengthSeconds: null,
      priceCents: 0,
      coverImageUrl: null,
    },
  });

  const coverImageUrl = watch("coverImageUrl");

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total]);

  const loadArtists = async () => {
    const res = await artistApi.fetchArtists({ page: 1, pageSize: 200 });
    setArtists(res.items);
  };

  const loadAlbums = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await albumApi.fetchAdminAlbums({ page, pageSize, q: q.trim() || undefined, artistId });
      setAlbums(res.items);
      setTotal(res.total);
    } catch (e: unknown) { // ⬅️ any vervangen door unknown
      if (e instanceof ApiError) {
        setError(e.body?.message ?? e.message ?? "Failed to load albums");
      } else if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Failed to load albums");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArtists().catch(() => undefined);
  }, []);

  useEffect(() => {
    loadAlbums().catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, q, artistId]);

  const startCreate = () => {
    setEditing(null);
    setError(null); // Zorg dat oude errors weggaan als we iets nieuws starten
    reset({
      title: "",
      artistId: artists[0]?.id ?? 0,
      dateReleased: new Date().toISOString().slice(0, 10),
      trackCount: null,
      lengthSeconds: null,
      priceCents: 0,
      coverImageUrl: null,
    });
  };

  const startEdit = (a: Album) => {
    setEditing(a);
    setError(null); // Zorg dat oude errors weggaan
    reset({
      title: a.title,
      artistId: a.artist.id,
      dateReleased: a.dateReleased.slice(0, 10),
      trackCount: a.trackCount ?? null,
      lengthSeconds: a.lengthSeconds ?? null,
      priceCents: a.priceCents,
      coverImageUrl: a.coverImageUrl ?? null,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit = async (values: AlbumForm) => {
    setError(null);
    try {
      const body = {
        title: values.title,
        artistId: Number(values.artistId),
        dateReleased: new Date(values.dateReleased).toISOString(),
        trackCount: values.trackCount === null ? null : Number(values.trackCount),
        lengthSeconds: values.lengthSeconds === null ? null : Number(values.lengthSeconds),
        priceCents: Number(values.priceCents),
        coverImageUrl: values.coverImageUrl,
      };

      if (editing) {
        await albumApi.updateAlbum(editing.id, body);
      } else {
        await albumApi.createAlbum(body);
      }

      await loadAlbums();
      startCreate();
    } catch (e: unknown) { 
      if (e instanceof ApiError) {
        setError(e.body?.message ?? e.message ?? "Failed to save album");
      } else if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Failed to save album");
      }
    }
  };

  const doDelete = async (id: number) => {
    if (!window.confirm("Delete this album?")) return;
    setError(null);
    try {
      await albumApi.deleteAlbum(id);
      await loadAlbums();
    } catch (e: unknown) { 
      if (e instanceof ApiError) {
        setError(e.body?.message ?? e.message ?? "Failed to delete album");
      } else {
        setError("Failed to delete album");
      }
    }
  };

  const doExport = async () => {
    setError(null);
    try {
      const csv = await albumApi.exportAlbumsCsv();
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "albums.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch { 
      setError("Failed to export CSV");
    }
  };

  const handleCoverFile = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const res = await uploadApi.uploadAlbumCover(file);
      setValue("coverImageUrl", res.url);
    } catch { 
      setError("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-neutral-800 p-6 rounded-lg">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-3xl font-bold">{editing ? "Edit album" : "Create album"}</h1>
          <div className="flex gap-2">
            <button onClick={startCreate} className="bg-neutral-900 border border-neutral-700 px-4 py-2 rounded-lg">
              New
            </button>
            <button onClick={doExport} className="bg-neutral-900 border border-neutral-700 px-4 py-2 rounded-lg">
              Export CSV
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-neutral-300">Title</label>
            <input className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2" {...register("title", { required: true })} />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-neutral-300">Artist</label>
            <select className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2" {...register("artistId", { valueAsNumber: true, required: true })}>
              {artists.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-neutral-300">Release date</label>
            <input type="date" className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2" {...register("dateReleased", { required: true })} />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-neutral-300">Price (cents)</label>
            <input type="number" min={0} className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2" {...register("priceCents", { valueAsNumber: true, required: true })} />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-neutral-300">Track count</label>
            <input type="number" className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2" {...register("trackCount", { setValueAs: (v) => v === "" ? null : Number(v) })} />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-neutral-300">Length (seconds)</label>
            <input type="number" className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2" {...register("lengthSeconds", { setValueAs: (v) => v === "" ? null : Number(v) })} />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-sm text-neutral-300">Cover image (JPEG upload)</label>
            <div className="flex gap-3 items-center flex-wrap">
              <input
                type="file"
                accept=".jpg,.jpeg,image/jpeg"
                onChange={(e) => handleCoverFile(e.target.files?.[0] ?? null)}
                className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2"
              />
              {uploading && <p className="text-neutral-400">Uploading…</p>}
              {coverImageUrl && (
                <div className="flex gap-3 items-center">
                  <img src={resolveImageUrl(coverImageUrl)} alt="cover preview" className="w-16 h-16 rounded-lg object-cover" />
                  <p className="text-neutral-400 font-mono text-sm">{coverImageUrl}</p>
                </div>
              )}
            </div>
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
      </div>

      <div className="bg-neutral-800 p-4 rounded-lg flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 w-full md:w-auto">
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Search albums…"
            className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 w-full md:w-80"
          />
          <select
            value={artistId}
            onChange={(e) => { const v = e.target.value; setArtistId(v ? Number(v) : ""); setPage(1); }}
            className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2"
          >
            <option value="">All artists</option>
            {artists.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>

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
        {albums.map((a) => (
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

export default AdminAlbumsPage;
