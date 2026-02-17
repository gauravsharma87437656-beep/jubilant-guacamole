import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  productSlug?: string;
  variantId?: string;
  variantSize?: string;
  variantColor?: string;
  dailyPrice: number;
  weeklyPrice?: number;
  depositAmount: number;
  vendorId: string;
  vendorName: string;
  rentalStart: Date | null;
  rentalEnd: Date | null;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  wishlist: CartItem[];
  isOpen: boolean;
  userId: string | null;
  addItem: (item: Omit<CartItem, "id" | "quantity">) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  updateRentalDates: (productId: string, start: Date, end: Date, variantId?: string) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
  getTotalDeposit: () => number;
  getTotalRentals: () => number;
  // Wishlist functions
  moveToWishlist: (productId: string, variantId?: string) => void;
  moveToCart: (productId: string, variantId?: string) => void;
  removeFromWishlist: (productId: string, variantId?: string) => void;
  isInWishlist: (productId: string, variantId?: string) => boolean;
  // User sync functions
  setUserId: (userId: string | null) => void;
  syncCartForUser: (userId: string) => void;
  clearOnLogout: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      wishlist: [],
      isOpen: false,
      userId: null,

      addItem: (item) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) => i.productId === item.productId && i.variantId === item.variantId
          );

          if (existingIndex > -1) {
            const newItems = [...state.items];
            newItems[existingIndex].quantity += 1;
            return { items: newItems };
          }

          return {
            items: [
              ...state.items,
              { ...item, id: crypto.randomUUID(), quantity: 1 },
            ],
          };
        });
      },

      removeItem: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.variantId === variantId)
          ),
        }));
      },

      updateQuantity: (productId, quantity, variantId) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId && i.variantId === variantId
              ? { ...i, quantity: Math.max(1, quantity) }
              : i
          ),
        }));
      },

      updateRentalDates: (productId, start, end, variantId) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId && i.variantId === variantId
              ? { ...i, rentalStart: start, rentalEnd: end }
              : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      setCartOpen: (open) => set({ isOpen: open }),

      getTotalDeposit: () => {
        return get().items.reduce(
          (total, item) => total + item.depositAmount * item.quantity,
          0
        );
      },

      getTotalRentals: () => {
        return get().items.length;
      },

      // Move item from cart to wishlist
      moveToWishlist: (productId, variantId) => {
        set((state) => {
          const item = state.items.find(
            (i) => i.productId === productId && i.variantId === variantId
          );
          if (!item) return state;

          // Check if already in wishlist
          const inWishlist = state.wishlist.some(
            (w) => w.productId === productId && w.variantId === variantId
          );

          return {
            items: state.items.filter(
              (i) => !(i.productId === productId && i.variantId === variantId)
            ),
            wishlist: inWishlist
              ? state.wishlist
              : [...state.wishlist, { ...item, quantity: 1 }],
          };
        });
      },

      // Move item from wishlist to cart
      moveToCart: (productId, variantId) => {
        set((state) => {
          const item = state.wishlist.find(
            (w) => w.productId === productId && w.variantId === variantId
          );
          if (!item) return state;

          const existingIndex = state.items.findIndex(
            (i) => i.productId === productId && i.variantId === variantId
          );

          let newItems;
          if (existingIndex > -1) {
            newItems = [...state.items];
            newItems[existingIndex].quantity += 1;
          } else {
            newItems = [...state.items, { ...item, quantity: 1 }];
          }

          return {
            wishlist: state.wishlist.filter(
              (w) => !(w.productId === productId && w.variantId === variantId)
            ),
            items: newItems,
          };
        });
      },

      // Remove from wishlist
      removeFromWishlist: (productId, variantId) => {
        set((state) => ({
          wishlist: state.wishlist.filter(
            (w) => !(w.productId === productId && w.variantId === variantId)
          ),
        }));
      },

      // Check if item is in wishlist
      isInWishlist: (productId, variantId) => {
        return get().wishlist.some(
          (w) => w.productId === productId && w.variantId === variantId
        );
      },

      // Set user ID
      setUserId: (userId) => set({ userId }),

      // Sync cart for user - call this on login
      syncCartForUser: (userId) => {
        const currentState = get();
        
        // Get all carts from storage
        if (typeof window !== "undefined") {
          const storageKey = "rent-square-cart";
          const stored = localStorage.getItem(storageKey);
          
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              // If there's a guest cart (no userId) and now user is logging in
              // merge the guest cart with user's cart
              if (!parsed.state.userId && parsed.state.items?.length > 0) {
                // Guest cart exists, keep it for the new user
                set({
                  userId,
                  items: parsed.state.items || [],
                  wishlist: parsed.state.wishlist || [],
                });
              } else if (parsed.state.userId === userId) {
                // Same user, restore their cart
                set({
                  userId,
                  items: parsed.state.items || [],
                  wishlist: parsed.state.wishlist || [],
                });
              } else {
                // Different user, start fresh
                set({ userId, items: [], wishlist: [] });
              }
            } catch {
              set({ userId });
            }
          } else {
            set({ userId });
          }
        }
      },

      // Clear cart on logout
      clearOnLogout: () => {
        set({ items: [], wishlist: [], userId: null });
      },
    }),
    {
      name: "rent-square-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        wishlist: state.wishlist,
        userId: state.userId,
      }),
    }
  )
);
