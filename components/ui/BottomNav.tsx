"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, List, Flag, Users, User } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  featured?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/home",
    label: "Home",
    icon: <Home size={22} />,
  },
  {
    href: "/rounds",
    label: "Rounds",
    icon: <List size={22} />,
  },
  {
    href: "/games",
    label: "Play",
    icon: <Flag size={24} />,
    featured: true,
  },
  {
    href: "/friends",
    label: "Friends",
    icon: <Users size={22} />,
  },
  {
    href: "/profile",
    label: "Profile",
    icon: <User size={22} />,
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-cream border-t border-ink/10 shadow-bottom z-50">
      <div className="flex items-end justify-around px-2 pt-2 pb-safe">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;

          if (item.featured) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1 -mt-5 mb-1"
              >
                <span
                  className={`
                    w-14 h-14 rounded-full flex items-center justify-center
                    shadow-card transition-all active:scale-95
                    ${isActive ? "bg-forest-light" : "bg-forest"}
                  `}
                >
                  <span className="text-white">{item.icon}</span>
                </span>
                <span
                  className={`font-inter text-[10px] font-medium ${
                    isActive ? "text-forest" : "text-muted"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 py-1 px-3 min-w-[44px] min-h-[44px] justify-center active:opacity-70 transition-opacity"
            >
              <span className={isActive ? "text-forest" : "text-muted"}>
                {item.icon}
              </span>
              <span
                className={`font-inter text-[10px] font-medium ${
                  isActive ? "text-forest" : "text-muted"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
