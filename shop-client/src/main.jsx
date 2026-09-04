import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { CartProvider } from './context/CartContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import App from './App';
import './styles/index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <CartProvider>
        <AdminAuthProvider><App /></AdminAuthProvider>
        <Toaster theme="dark" richColors position="bottom-right" />
      </CartProvider>
    </BrowserRouter>
  </StrictMode>,
);
