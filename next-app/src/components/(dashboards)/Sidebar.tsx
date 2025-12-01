"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Home,
  LayoutDashboard,
  Users,
  FolderTree,
  Images,
  Tag,
  Layers,
  Palette,
  LogOut,
  User,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import logo from "@/public/final.png";
import { LiaThListSolid } from "react-icons/lia";
import { PiListChecksDuotone } from "react-icons/pi";

// 🔹 All nav links
const navLinks = [
  { href: "/", label: "Home", icon: Home, roles: ["Admin"] },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["Admin"] },
  { href: "/dashboard/users", label: "Users", icon: Users, roles: ["Admin"] },
  { href: "/dashboard/categories", label: "Categories", icon: FolderTree, roles: ["Admin"] },
  { href: "/dashboard/orders", label: "Orders", icon: FolderTree, roles: ["Admin"] },
  { href: "/dashboard/sliders", label: "Sliders", icon: Images, roles: ["Admin"] },
  { href: "/dashboard/brands", label: "Brands", icon: Tag, roles: ["Admin"] },
  { href: "/dashboard/attributes", label: "Attributes", icon: Layers, roles: ["Admin"] },
  // { href: "/dashboard/themes", label: "Themes", icon: Palette, roles: ["Admin"] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(true);
  const [isDown, setIsDown] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsOpen(window.innerWidth >= 768);
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setShowUserModal(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDown = () => setIsDown(!isDown);
  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const activeLink = navLinks.reduce(
    (prev, curr) =>
      pathname.startsWith(curr.href) && curr.href.length > prev.href.length ? curr : prev,
    navLinks[0]
  );

  const userRole = user?.role || "Visitor";
  const filteredLinks = navLinks.filter(
    (link) => userRole === "Admin" || link.roles.includes(userRole)
  );

  return (
    <aside
      className={`transition-all ps-2 duration-300 ease-in-out lg:sticky lg:top-0 max-lg:fixed max-lg:h-[100dvh] max-lg:left-0 z-[1199]
        ${!isDown ? "max-lg:top-0" : "max-lg:-top-full"} 
        ${isOpen ? "lg:w-[260px] w-[220px]" : "w-[4.9375rem]"} 
        text-gray-800 h-[100dvh] flex flex-col justify-between 
       `}
    >
      {/* Toggle for mobile */}
      <button
        onClick={handleDown}
        className="lg:hidden text-gray-800 cursor-pointer fixed top-2 right-3 size-14 flex justify-center items-center backdrop-blur-sm border border-gray-200 rounded-full bg-white/70 shadow-sm"
      >
        <PiListChecksDuotone size={20} className={`transition ${isDown ? "rotate-0" : "rotate-180"}`} />
      </button>

      {/* Logo */}
      <div
        className={`flex items-center px-4 py-3 rounded-2xl border border-gray-200 bg-white shadow-sm mt-2 
          ${isOpen ? "justify-between" : "justify-center"}`}
      >
        <Link href="/" className={`logo italic font-bold h-[1.5rem] text-4xl text-gray-800`}>
          <Image src={logo} alt="Logo" className="h-full w-full object-contain" />
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-600 hover:text-[#ff9903] cursor-pointer focus:outline-none"
        >
          <LiaThListSolid size={20} />
        </button>
      </div>

      {/* Nav */}
      <nav className="my-2 flex-1 overflow-y-auto scrollHide rounded-2xl border border-gray-200 bg-white p-2 shadow-sm">
        {filteredLinks.map(({ href, label, icon: Icon }) => {
          const isActive = activeLink.href === href;
          return (
            <Link key={href} href={href} onClick={handleDown} className="block mb-1 last:mb-0">
              <div
                className={`flex items-center py-2.5 rounded-xl cursor-pointer transition-all duration-200
                  ${isOpen ? "justify-between px-3" : "justify-center px-3"} 
                  ${isActive
                    ? "bg-[#fff8ef] border-l-4 border-[#ff9903] text-[#ff9903] shadow-sm"
                    : "text-gray-700 hover:bg-gray-50 hover:text-[#ff9903]"
                  }`}
              >
                <div className="flex items-center flex-1">
                  <Icon className="w-5 h-5" />
                  <span
                    className={`text-sm font-medium text-nowrap pt-1 transition-all duration-300 overflow-hidden 
                      ${isOpen ? "ml-3 w-auto" : "w-0"}`}
                  >
                    {label}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Menu */}
      <div className="relative rounded-2xl border border-gray-200 bg-white shadow-sm mb-2">
        <div
          onClick={() => setShowUserModal((prev) => !prev)}
          className="flex items-center cursor-pointer py-2 px-2.5 rounded-md hover:bg-gray-50"
        >
          <div className="size-8 bg-[#ff9903] text-white rounded-full flex items-center justify-center text-sm font-bold">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <span
            className={`text-sm font-medium pt-1 transition-all duration-300 overflow-hidden 
              ${isOpen ? "ml-3 w-auto" : "w-0"}`}
          >
            {user?.name || "User"}
          </span>
        </div>

        {showUserModal && (
          <div
            ref={modalRef}
            className="absolute bottom-16 left-2 bg-white border border-gray-100 shadow-xl rounded-xl w-60 z-50 overflow-hidden transition-all duration-200"
          >
            <div className="py-1">
              <Link
                href="/"
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-[#fff8ef] hover:text-[#ff9903] transition-all duration-150"
              >
                <Home className="w-4 h-4" />
                Home
              </Link>
              <Link
                href="/profile"
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-[#fff8ef] hover:text-[#ff9903] transition-all duration-150"
              >
                <User className="w-4 h-4" />
                Profile
              </Link>
            </div>

            <div className="border-t border-gray-100">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-all duration-150"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        )}

      </div>
    </aside>
  );
}
