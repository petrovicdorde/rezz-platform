import { createRootRoute, Outlet } from '@tanstack/react-router';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Navbar } from '@/components/layout/Navbar';
import { LoginDrawer } from '@/components/auth/LoginDrawer';
import { LoginModal } from '@/components/auth/LoginModal';
import { useMediaQuery } from '@/hooks/useMediaQuery';

function RootLayout() {
  const isMobile = useMediaQuery('(max-width: 767px)');

  return (
    <>
      <Navbar />
      <Outlet />
      {isMobile ? <LoginDrawer /> : <LoginModal />}
      <ToastContainer position="top-right" />
    </>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
});
