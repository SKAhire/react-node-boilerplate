import Login from "@/pages/login";
import Home from "../pages/home";
import { Route, Routes } from "react-router-dom";
import Register from "@/pages/Register";
export default function AppRoute() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="sign-up" element={<Register />} />
    </Routes>
  );
}
