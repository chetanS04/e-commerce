import Sidebar from "@/components/(dashboards)/Sidebar";
import ProtectedRoute from "@/components/(sheared)/ProtectedRoute";


export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute role="Admin">
      <div className="lg:flex min-h-screen max-w-[200rem] mx-auto">
        <Sidebar />
        <main className="flex-1 pt-[10px] px-5 max-lg:pt-[50px]">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
