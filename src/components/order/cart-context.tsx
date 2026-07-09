"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";

export interface CartItem {
  itemId: string;
  name: string;
  priceCents: number;
  qty: number;
  imageKey?: string | null;
}

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: "ADD"; item: Omit<CartItem, "qty">; qty?: number }
  | { type: "REMOVE"; itemId: string }
  | { type: "SET_QTY"; itemId: string; qty: number }
  | { type: "CLEAR" }
  | { type: "HYDRATE"; items: CartItem[] };

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "HYDRATE":
      return { items: action.items };
    case "ADD": {
      const qty = action.qty ?? 1;
      const existing = state.items.find((i) => i.itemId === action.item.itemId);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.itemId === action.item.itemId ? { ...i, qty: i.qty + qty } : i
          ),
        };
      }
      return { items: [...state.items, { ...action.item, qty }] };
    }
    case "REMOVE":
      return { items: state.items.filter((i) => i.itemId !== action.itemId) };
    case "SET_QTY":
      if (action.qty <= 0) {
        return { items: state.items.filter((i) => i.itemId !== action.itemId) };
      }
      return {
        items: state.items.map((i) =>
          i.itemId === action.itemId ? { ...i, qty: action.qty } : i
        ),
      };
    case "CLEAR":
      return { items: [] };
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeItem: (itemId: string) => void;
  setQty: (itemId: string, qty: number) => void;
  clear: () => void;
  totalCents: number;
  totalItems: number;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "sassys_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] });

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const items = JSON.parse(raw) as CartItem[];
        dispatch({ type: "HYDRATE", items });
      }
    } catch {}
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {}
  }, [state.items]);

  const addItem = useCallback(
    (item: Omit<CartItem, "qty">, qty?: number) =>
      dispatch({ type: "ADD", item, qty }),
    []
  );
  const removeItem = useCallback(
    (itemId: string) => dispatch({ type: "REMOVE", itemId }),
    []
  );
  const setQty = useCallback(
    (itemId: string, qty: number) => dispatch({ type: "SET_QTY", itemId, qty }),
    []
  );
  const clear = useCallback(() => dispatch({ type: "CLEAR" }), []);

  const totalCents = state.items.reduce(
    (sum, i) => sum + i.priceCents * i.qty,
    0
  );
  const totalItems = state.items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider
      value={{ items: state.items, addItem, removeItem, setQty, clear, totalCents, totalItems }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
}
