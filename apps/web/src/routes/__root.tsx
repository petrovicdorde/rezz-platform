import { createRootRoute, Outlet } from '@tanstack/react-router';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Navbar } from '@/components/layout/Navbar';
import { LoginDrawer } from '@/components/auth/LoginDrawer';
import { LoginModal } from '@/components/auth/LoginModal';
import { RegisterDrawer } from '@/components/auth/RegisterDrawer';
import { RegisterModal } from '@/components/auth/RegisterModal';
import { useMediaQuery } from '@/hooks/useMediaQuery';

function RootLayout() {
  const isMobile = useMediaQuery('(max-width: 767px)');

  return (
    <>
      <Navbar />
      <Outlet />
      {isMobile ? <LoginDrawer /> : <LoginModal />}
      {isMobile ? <RegisterDrawer /> : <RegisterModal />}
      <ToastContainer
        position="top-right"
        limit={1}
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable={false}
      />
    </>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
});
