import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Stock from "./pages/Stock";
import Suppliers from "./pages/Suppliers";
import Attendants from "./pages/Attendants";
import Sales from "./pages/Sales";
import Customers from "./pages/Customers";
import Summary from "./pages/Summary";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import Home from "./pages/Home";

export default function App() {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route element={<Layout />}>
        <Route
          path='/dashboard'
          element={
            <ProtectedRoute roles={["ADMIN", "MANAGER", "ATTENDANT"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path='products'
          element={
            <ProtectedRoute roles={["ADMIN", "MANAGER"]}>
              <Products />
            </ProtectedRoute>
          }
        />
        <Route
          path='stock'
          element={
            <ProtectedRoute roles={["ADMIN", "MANAGER"]}>
              <Stock />
            </ProtectedRoute>
          }
        />
        <Route
          path='suppliers'
          element={
            <ProtectedRoute roles={["ADMIN", "MANAGER"]}>
              <Suppliers />
            </ProtectedRoute>
          }
        />
        <Route
          path='attendants'
          element={
            <ProtectedRoute roles={["ADMIN", "MANAGER"]}>
              <Attendants />
            </ProtectedRoute>
          }
        />
        <Route
          path='sales'
          element={
            <ProtectedRoute roles={["ADMIN", "MANAGER", "ATTENDANT"]}>
              <Sales />
            </ProtectedRoute>
          }
        />
        <Route
          path='customers'
          element={
            <ProtectedRoute roles={["ADMIN", "MANAGER", "ATTENDANT"]}>
              <Customers />
            </ProtectedRoute>
          }
        />
        <Route
          path='summary'
          element={
            <ProtectedRoute roles={["ADMIN", "MANAGER"]}>
              <Summary />
            </ProtectedRoute>
          }
        />
        <Route
          path='reports'
          element={
            <ProtectedRoute roles={["ADMIN", "MANAGER"]}>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path='profile'
          element={
            <ProtectedRoute roles={["ADMIN", "MANAGER"]}>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="settings" element={<Navigate to="/profile" replace />} />
      </Route>

      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  );
}
