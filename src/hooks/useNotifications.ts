import { useState, useEffect, useCallback, useRef } from "react";
import { notificationsApi } from "../config/apiCall";
import type {
  Notification,
  NotificationCategory,
  UnreadCountData,
} from "../utils/notificationTypes";

const POLL_INTERVAL_MS = 30_000; // 30 s per spec

// ─── State shape ──────────────────────────────────────────────────────────────

interface NotificationsState {
  // Bell badge
  unreadCount: UnreadCountData | null;
  isCountLoading: boolean;

  // Drawer list
  notifications: Notification[];
  isListLoading: boolean;
  hasMore: boolean;
  currentPage: number;

  // Active filter
  activeCategory: NotificationCategory | "all";

  // Errors
  error: string | null;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useNotifications() {
  const [state, setState] = useState<NotificationsState>({
    unreadCount: null,
    isCountLoading: false,
    notifications: [],
    isListLoading: false,
    hasMore: false,
    currentPage: 1,
    activeCategory: "all",
    error: null,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fetch unread count (used for bell badge + polling) ────────────────────

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await notificationsApi.unreadCount();
      const data: UnreadCountData = res.data?.data;
      setState((prev) => ({ ...prev, unreadCount: data }));
    } catch {
      // silently fail — badge just won't update
    }
  }, []);

  // ── Fetch notification list ───────────────────────────────────────────────

  const fetchNotifications = useCallback(
    async (category: NotificationCategory | "all", page = 1) => {
      setState((prev) => ({ ...prev, isListLoading: true, error: null }));
      try {
        const params: Record<string, unknown> = { page, limit: 20 };
        if (category !== "all") params.category = category;

        const res = await notificationsApi.list(params as Parameters<typeof notificationsApi.list>[0]);
        const data = res.data?.data;

        setState((prev) => ({
          ...prev,
          notifications:
            page === 1
              ? data.notifications
              : [...prev.notifications, ...data.notifications],
          hasMore: data.has_next,
          currentPage: page,
          isListLoading: false,
        }));
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to load notifications";
        setState((prev) => ({ ...prev, isListLoading: false, error: message }));
      }
    },
    [],
  );

  // ── Change active category tab ────────────────────────────────────────────

  const setCategory = useCallback(
    (category: NotificationCategory | "all") => {
      setState((prev) => ({
        ...prev,
        activeCategory: category,
        notifications: [],
        currentPage: 1,
      }));
      fetchNotifications(category, 1);
    },
    [fetchNotifications],
  );

  // ── Load more (pagination) ────────────────────────────────────────────────

  const loadMore = useCallback(() => {
    if (!state.isListLoading && state.hasMore) {
      fetchNotifications(state.activeCategory, state.currentPage + 1);
    }
  }, [
    state.isListLoading,
    state.hasMore,
    state.activeCategory,
    state.currentPage,
    fetchNotifications,
  ]);

  // ── Mark single read ──────────────────────────────────────────────────────

  const markRead = useCallback(
    async (id: string) => {
      try {
        await notificationsApi.markRead(id);
        setState((prev) => ({
          ...prev,
          notifications: prev.notifications.map((n) =>
            n._id === id ? { ...n, read_at: new Date().toISOString() } : n,
          ),
          unreadCount: prev.unreadCount
            ? {
                ...prev.unreadCount,
                total: Math.max(0, prev.unreadCount.total - 1),
              }
            : null,
        }));
      } catch {
        // silently fail — will resync on next poll
      }
    },
    [],
  );

  // ── Mark all read ─────────────────────────────────────────────────────────

  const markAllRead = useCallback(
    async (category?: NotificationCategory) => {
      try {
        await notificationsApi.markAllRead(category);
        setState((prev) => ({
          ...prev,
          notifications: prev.notifications.map((n) =>
            !category || n.category === category
              ? { ...n, read_at: new Date().toISOString() }
              : n,
          ),
          unreadCount: prev.unreadCount
            ? {
                ...prev.unreadCount,
                total: category
                  ? Math.max(
                      0,
                      prev.unreadCount.total -
                        (prev.unreadCount.by_category[category] ?? 0),
                    )
                  : 0,
                by_category: category
                  ? {
                      ...prev.unreadCount.by_category,
                      [category]: 0,
                    }
                  : {
                      attendance: 0,
                      inventory: 0,
                      rota: 0,
                      system: 0,
                    },
              }
            : null,
        }));
      } catch {
        // silently fail
      }
    },
    [],
  );

  // ── Archive (soft-delete) ─────────────────────────────────────────────────

  const archive = useCallback(async (id: string) => {
    try {
      await notificationsApi.archive(id);
      setState((prev) => ({
        ...prev,
        notifications: prev.notifications.filter((n) => n._id !== id),
      }));
    } catch {
      // silently fail
    }
  }, []);

  // ── Refresh (re-fetch from page 1) ────────────────────────────────────────

  const refresh = useCallback(() => {
    fetchUnreadCount();
    fetchNotifications(state.activeCategory, 1);
  }, [fetchUnreadCount, fetchNotifications, state.activeCategory]);

  // ── Bootstrap + polling ───────────────────────────────────────────────────

  useEffect(() => {
    fetchUnreadCount();

    intervalRef.current = setInterval(fetchUnreadCount, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchUnreadCount]);

  return {
    ...state,
    fetchNotifications,
    setCategory,
    loadMore,
    markRead,
    markAllRead,
    archive,
    refresh,
  };
}
