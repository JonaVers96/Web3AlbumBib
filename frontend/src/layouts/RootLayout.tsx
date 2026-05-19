import { Outlet } from "react-router-dom";
import Header from "../components/Header";

const RootLayout = () => {
  return (
    <div className="bg-neutral-900 text-neutral-50 w-full min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow p-8">
        <Outlet />
      </div>
      <footer className="border-t border-neutral-800 p-4 text-sm text-neutral-500 text-center">
        Webify Shop — demo webshop met Mollie checkout
      </footer>
    </div>
  );
};

export default RootLayout;
