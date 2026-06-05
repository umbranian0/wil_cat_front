'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import siteConfig from '@/lib/config';

const CartContext = createContext();

const WHATSAPP_NUMBER = siteConfig.whatsappNumber;
const ORDER_EMAIL = siteConfig.orderEmail;

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback((product, qty = 1) => {
    setItems(prev => {
      const existing = prev.findIndex(item => item.id === product.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], qty: updated[existing].qty + qty };
        return updated;
      }
      return [...prev, { ...product, qty }];
    });
  }, []);

  const updateQty = useCallback((index, delta) => {
    setItems(prev => {
      const updated = [...prev];
      const newQty = updated[index].qty + delta;
      if (newQty <= 0) {
        return prev.filter((_, i) => i !== index);
      }
      updated[index] = { ...updated[index], qty: newQty };
      return updated;
    });
  }, []);

  const removeItem = useCallback((index) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  const buildOrderSummary = useCallback(() => {
    if (items.length === 0) return '';
    let summary = 'Hi! I would like to order:\n\n';
    items.forEach(item => {
      summary += `• ${item.name} × ${item.qty} — €${(item.price * item.qty).toFixed(2)}\n`;
    });
    summary += `\nTotal: €${totalPrice.toFixed(2)}`;
    summary += '\n\nPlease confirm availability, shipping, and next steps. Thank you!';
    return summary;
  }, [items, totalPrice]);

  const checkoutWhatsApp = useCallback(() => {
    const text = encodeURIComponent(buildOrderSummary());
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank');
  }, [buildOrderSummary]);

  const checkoutEmail = useCallback(() => {
    const subject = encodeURIComponent('New Order — Wild Cat Ceramic');
    const body = encodeURIComponent(buildOrderSummary());
    window.open(`mailto:${ORDER_EMAIL}?subject=${subject}&body=${body}`, '_blank');
  }, [buildOrderSummary]);

  return (
    <CartContext.Provider value={{
      items, isOpen, setIsOpen,
      addItem, updateQty, removeItem,
      totalItems, totalPrice,
      checkoutWhatsApp, checkoutEmail,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
