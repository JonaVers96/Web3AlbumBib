import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

import RootLayout from "./layouts/RootLayout";
import AdminLayout from "./layouts/AdminLayout";

import StorePage from "./pages/StorePage";
import AlbumDetailPage from "./pages/AlbumDetailPage";
import CartPage from "./pages/CartPage";
import PaymentReturnPage from "./pages/PaymentReturnPage";
import LibraryPage from "./pages/LibraryPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import AdminHomePage from "./pages/admin/AdminHomePage";
import AdminAlbumsPage from "./pages/admin/AdminAlbumsPage";
import AdminArtistsPage from "./pages/admin/AdminArtistsPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";

import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <StorePage /> },
      { path: "albums/:id", element: <AlbumDetailPage /> },
      { path: "cart", element: <CartPage /> },
      { path: "payment/return", element: <PaymentReturnPage /> },
      { path: "library", element: <LibraryPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      {
        path: "admin",
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminHomePage /> },
          { path: "albums", element: <AdminAlbumsPage /> },
          { path: "artists", element: <AdminArtistsPage /> },
          { path: "users", element: <AdminUsersPage /> },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </AuthProvider>
  </StrictMode>
);
