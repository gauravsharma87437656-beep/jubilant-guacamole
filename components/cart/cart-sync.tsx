"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store/cart";

export function CartSync() {
  const { data: session, status } = useSession();
  const { syncCartForUser, clearOnLogout, userId } = useCartStore();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      // User logged in - sync cart
      if (userId !== session.user.id) {
        syncCartForUser(session.user.id);
      }
    } else if (status === "unauthenticated" && userId) {
      // User logged out - clear cart
      clearOnLogout();
    }
  }, [status, session?.user?.id, userId, syncCartForUser, clearOnLogout]);

  return null;
}
