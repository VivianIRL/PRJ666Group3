// PublicLayout.jsx — wraps public/static pages with the footer
import { Outlet } from "react-router-dom";
import Footer from "../navigation/Footer";

export default function PublicLayout() {
  return (
    <>
      <Outlet />
      <Footer />
    </>
  );
}
