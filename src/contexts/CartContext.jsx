import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from "react";

export const CartContext = createContext(null);
const CART_STORAGE = "CART_STORAGE";

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartLoading, setIsCartLoading] = useState(true);

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE);
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        if (Array.isArray(parsedCart)) {
          setCartItems(parsedCart);
        } else {
          localStorage.removeItem(CART_STORAGE);
        }
      }
    } catch (e) {
      console.error("Error loading cart from localStorage:", e);
    }
    setIsCartLoading(false);
  }, []);

  useEffect(() => {
    if (!isCartLoading) {
      localStorage.setItem(CART_STORAGE, JSON.stringify(cartItems));
    }
  }, [cartItems, isCartLoading]);

  const addToCart = useCallback((book, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === book.id);
      if (existing) {
        return prev.map((item) =>
          item.id === book.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...book, quantity }];
    });
  }, []);

  const removeFromCart = useCallback((bookId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== bookId));
  }, []);

  const updateQuantity = useCallback((bookId, quantity) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === bookId
            ? { ...item, quantity: Math.max(0, quantity) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const getItemCount = useCallback(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const getTotalPrice = useCallback(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  const value = useMemo(
    () => ({
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getItemCount,
      getTotalPrice,
      isCartLoading,
    }),
    [
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getItemCount,
      getTotalPrice,
      isCartLoading,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
export const useCart = () => useContext(CartContext);
