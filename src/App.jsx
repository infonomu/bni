import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import EditProduct from './pages/EditProduct';
import MyProducts from './pages/MyProducts';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Guide from './pages/Guide';
import { useAuthStore } from './hooks/useAuth';

function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="edit/:id" element={<EditProduct />} />
        <Route path="my-products" element={<MyProducts />} />
        <Route path="profile" element={<Profile />} />
        <Route path="admin" element={<Admin />} />
        <Route path="guide" element={<Guide />} />
      </Route>
    </Routes>
  );
}

export default App;
