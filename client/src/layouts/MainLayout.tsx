import Navbar from "../components/layout/Navbar";

const MainLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div>
      <Navbar />
      <main className="p-6">{children}</main>
    </div>
  );
};

export default MainLayout;