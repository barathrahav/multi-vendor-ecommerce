import Navbar from "../components/layout/Navbar";

const MainLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="page-shell py-8">
        <div className="space-y-8">{children}</div>
      </main>
    </div>
  );
};

export default MainLayout;