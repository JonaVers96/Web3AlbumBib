import { apiFetch } from "./client";

export const uploadAlbumCover = async (file: File) => {
  const form = new FormData();
  form.append("file", file);

  return apiFetch<{ url: string }>(`/uploads/album-cover`, {
    method: "POST",
    auth: true,
    body: form,
  });
};
