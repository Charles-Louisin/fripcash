"use client";

import { api } from "./client";

export async function authorizePusher(body: {
  socket_id: string;
  channel_name: string;
}) {
  const { data } = await api.post("/pusher/auth", body);
  return data;
}

/** Mobile push (Beams) — optional on web. */
export async function authorizeBeams() {
  const { data } = await api.post("/pusher/beams-auth");
  return data;
}
