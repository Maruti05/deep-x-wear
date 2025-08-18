// hooks/useUserDetails.ts
import useSWR from "swr";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const error = new Error(errData.error || `Request failed: ${res.status}`);
    (error as any).status = res.status;
    (error as any).details = errData;
    throw error;
  }
  return res.json();
};

export function useUserDetails() {
  // ❌ No auto-fetch on mount → initial key = null
  const {
    data: user,
    error,
    isLoading,
    mutate: refresh,
  } = useSWR(null, fetcher, { revalidateOnFocus: false });

  // 🔹 GET user manually
  const getUser = async () => {
    try {
      const res = await fetch("/api/user-details", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw Object.assign(new Error(errData.error || "Fetch failed"), {
          status: res.status,
          details: errData,
        });
      }
      const data = await res.json();
      // Update SWR cache
      refresh(data, false);
      return data;
    } catch (err) {
      console.error("Get user failed:", err);
      throw err;
    }
  };

  // 🔹 Insert new user
  const insertUser = async (payload: Record<string, any>) => {
    try {
      const res = await fetch("/api/user-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw Object.assign(new Error(errData.error || "Insert failed"), {
          status: res.status,
          details: errData,
        });
      }
      const data = await res.json();
      await refresh();
      return data;
    } catch (err) {
      console.error("Insert user failed:", err);
      throw err;
    }
  };

  // 🔹 Update user
  const updateUser = async (payload: Record<string, any>) => {
    try {
      const res = await fetch("/api/user-details", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw Object.assign(new Error(errData.error || "Update failed"), {
          status: res.status,
          details: errData,
        });
      }
      const data = await res.json();
      await refresh();
      return data;
    } catch (err) {
      console.error("Update user failed:", err);
      throw err;
    }
  };

  return {
    user: user ?? null,
    isLoading,
    isError: Boolean(error),
    error: error ?? null,
    refresh,
    getUser,     // 👈 manual fetch
    insertUser,
    updateUser,
  } as const;
}
