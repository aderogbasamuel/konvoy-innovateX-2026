"use client";

import { useState } from "react";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { DISPLAY } from "@/components/landing/styles";
import { NOTIFICATIONS } from "@/lib/mock";

export default function NotificationsPage() {
  // TODO: GET /notifications, POST /notifications/{id}/read
  const [items, setItems] = useState(NOTIFICATIONS);
  const unread = items.filter((n) => !n.read).length;

  const markRead = (id: string) => setItems((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const markAll = () => setItems((list) => list.map((n) => ({ ...n, read: true })));

  return (
    <main className="min-h-dvh bg-[#F2F6F1] pb-10 font-[family-name:var(--font-body)] text-[#10201A]">
      <ScreenHeader title="Notifications" subtitle={unread ? `${unread} unread` : "You are all caught up."}>
        {unread > 0 && (
          <button
            type="button"
            onClick={markAll}
            className="mt-3 min-h-11 rounded-full border-[1.5px] border-white/35 px-4 text-sm font-semibold focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#FFC20E]"
          >
            Mark all as read
          </button>
        )}
      </ScreenHeader>

      <ul className="m-0 mx-auto -mt-10 grid max-w-md list-none gap-3 p-0 px-5">
        {items.map((n) => (
          <li key={n.id}>
            <button
              type="button"
              onClick={() => markRead(n.id)}
              className="flex w-full items-start gap-3 rounded-3xl bg-white p-4 text-left shadow-[0_8px_24px_rgba(10,59,34,0.08)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#11603A]"
            >
              <span aria-hidden="true" className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${n.read ? "bg-transparent" : "bg-[#FFC20E]"}`} />
              <span className="flex-1">
                <span className={`${DISPLAY} block font-semibold`}>
                  {n.title}
                  {!n.read && <span className="sr-only"> (unread)</span>}
                </span>
                <span className="block text-sm text-[#4C5F55]">{n.body}</span>
                <span className="mt-1 block text-xs text-[#4C5F55]">{n.time}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}