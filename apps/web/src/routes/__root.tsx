import { createRootRoute, Outlet } from '@tanstack/react-router';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <ToastContainer position="top-right" />
    </>
  ),
});
