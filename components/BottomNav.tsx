"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bus, Home, MessagesSquare, User, Users, type LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  Icon: LucideIcon;
  /** Optional unread count, e.g. new Buddy replies */
  badge?: number;
}

const NAV: NavItem[] = [
  { href: "/home", label: "Home", Icon: Home },
  { href: "/trips", label: "My Trips", Icon: Bus },
  { href: "/squad", label: "Squad", Icon: Users },
  { href: "/buddies", label: "Buddies", Icon: MessagesSquare },
  { href: "/profile", label: "Profile", Icon: User },
];

export default function BottomNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-[#DCE6DD] bg-white/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(16,32,26,0.05)] backdrop-blur"
    >
      <ul className="m-0 mx-auto flex max-w-md list-none p-0 px-2">
        {NAV.map(({ href, label, Icon, badge }) => {
          // Exact match or a child route, so "/home" doesn't light up for "/homework"
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`flex min-h-[60px] w-full flex-col items-center justify-center gap-0.5 rounded-2xl text-xs font-semibold active:bg-[#F2F6F1] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[-3px] focus-visible:outline-[#11603A] ${
                  isActive ? "text-[#0A3B22]" : "text-[#4C5F55]"
                }`}
              >
                <span
                  className={`relative grid h-8 w-14 place-items-center rounded-full transition-colors motion-reduce:transition-none ${
                    isActive ? "bg-[#FFC20E]/35" : "bg-transparent"
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.4 : 1.8} aria-hidden="true" />
                  {badge ? (
                    <span
                      aria-hidden="true"
                      className="absolute right-2 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-[#B3261E] px-1 text-[10px] font-bold leading-none text-white"
                    >
                      {badge > 9 ? "9+" : badge}
                    </span>
                  ) : null}
                </span>
                {label}
                {badge ? <span className="sr-only">, {badge} unread</span> : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}