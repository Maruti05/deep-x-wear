"use client";
import { useCart } from "@/app/context/CartContext";
import {
  Trash2,
  ShoppingCart,
  PackageCheck,
  ReceiptText,
  Minus,
  Plus,
  HandCoins,
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Checkbox } from "../ui/checkbox";
import { getDiscountedPrice } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { useAuth } from "@/app/context/AuthContext";
import Banner from "./CheckoutBanner";
import { useModal } from "@/app/context/ModalContext";
import { supabase } from "../admin/ProductForm";
import PayButton from "../common/PayButton";

export default function CartView() {
  const { openModal } = useModal();
  const { user: authUser } = useAuth();
  const { cart, updateCartItem, removeFromCart, clearCart } = useCart();
  const [selectedItems, setSelectedItems] = useState<boolean[]>(
    cart.map(() => true)
  );
  const [confirmClear, setConfirmClear] = useState(false);
  console.log("isProfileComplete", authUser?.isProfileCompleted);

  const handleSelectChange = (index: number) => {
    const updated = [...selectedItems];
    updated[index] = !updated[index];
    setSelectedItems(updated);
  };

  const afterDiscAmount = cart.reduce((acc, item, i) => {
    return selectedItems[i] ? acc + item.calculatedPrice * item.quantity : acc;
  }, 0);
  const totalAmount = cart.reduce((acc, item, i) => {
    return selectedItems[i]
      ? acc + parseFloat(item.price) * item.quantity
      : acc;
  }, 0);
  const isDisabled =
    afterDiscAmount === 0 ||
    cart.length === 0 ||
    !authUser?.isLoginnedIn ||
    !authUser.isProfileCompleted;

  // const handleClick = useCallback(

  //   (e: React.MouseEvent) => {
  //     if (isDisabled) {
  //       e.preventDefault(); // 🛑 prevent link navigation
  //       e.stopPropagation();
  //     }else{
  //       openModal("payment-confirm");
  //     }
  //   },
  //   [isDisabled]
  // );
const onClickPlaceOrder = async () => {
  if (isDisabled) return;

  try {

    // build order items payload
    const selectedCartItems = cart.filter((_, i) => selectedItems[i]);

    const subtotal = selectedCartItems.reduce(
      (acc, item) => acc + item.calculatedPrice * item.quantity,
      0
    );

    // Step 1: Insert Order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: authUser.id,
        order_number: `ORD-${Date.now()}`, // simple unique order number
        subtotal,
        total: subtotal, // add tax/shipping if needed
        status: "pending",
        payment_status: "pending",
        notes: null,
      })
      .select()
      .single();

    if (orderError) {
      console.error(orderError);
      toast.error("Failed to place order.");
      return;
    }

    // Step 2: Insert Order Items
    const orderItemsPayload = selectedCartItems.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      price: item.calculatedPrice,
      product_snapshot: {
        name: item.name,
        price: item.price,
        discount: item.discount,
      },
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItemsPayload);

    if (itemsError) {
      console.error(itemsError);
      toast.error("Failed to add order items.");
      return;
    }

    // ✅ Step 3: Open Payment Confirmation modal
    openModal("payment-confirm", { order }); // pass order to modal
    toast.success("Order created, please confirm payment.");
  } catch (err) {
    console.error(err);
    toast.error("Something went wrong while placing the order.");
  }
};
  return (
    <div
      className={`grid gap-6 p-4 h-auto] ${
        cart.length > 0 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
      }`}
    >
      {/* LEFT: Cart List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          {cart.length > 0 && (
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Cart Summary
            </h2>
          )}

          {cart.length > 0 && (
            <Dialog open={confirmClear} onOpenChange={setConfirmClear}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Cart
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you sure?</DialogTitle>
                </DialogHeader>
                <p>This will remove all products from your cart.</p>
                <DialogFooter className="mt-4">
                  <Button
                    variant="ghost"
                    onClick={() => setConfirmClear(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      clearCart();
                      setConfirmClear(false);
                      toast.warning("All items removed from cart.");
                    }}
                  >
                    Yes, Clear
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {cart.length > 0 && <Separator />}

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-250px)] text-center text-muted-foreground">
            <ShoppingCart className="w-12 h-12 mb-3" />
            <p className="text-lg font-medium">Your cart is empty</p>
            <p className="text-sm text-muted-foreground">
              Add some items to get started
            </p>
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            {cart.map((item, i) => (
              <div
                key={i}
                className="flex gap-4 border rounded-lg p-3 items-center"
              >
                <Checkbox
                  checked={selectedItems[i]}
                  onCheckedChange={() => handleSelectChange(i)}
                />
                <Image
                  src={item.mainImageUrl}
                  alt={item.name}
                  width={80}
                  height={80}
                  className="rounded object-cover"
                />
                <div className="flex-1 space-y-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Size: {item.size} | Color: {item.color}
                  </p>
                  <div className="flex items-center gap-2">
                    {item.price && item.discount && (
                      <p className="text-2sl font-semibold">
                        ₹
                        {getDiscountedPrice(
                          item.price,
                          item.discount
                        ).toLocaleString()}
                      </p>
                    )}
                    <p className="text-2sl text-muted-foreground line-through">
                      ₹{parseInt(item.price).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const newQty = Math.max(1, item.quantity - 1);
                        updateCartItem(i, { quantity: newQty });
                      }}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-10 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const newQty = Math.min(
                          item.stockQuantity || 0,
                          item.quantity + 1
                        );
                        updateCartItem(i, { quantity: newQty });
                      }}
                      disabled={item.quantity >= item.stockQuantity}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        removeFromCart(i);
                        toast.warning(`${item.name} removed from cart.`);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT: Invoice Summary (shown only if cart has items) */}
      {cart.length > 0 && (
        <div className="border rounded-lg p-4 shadow-sm h-fit">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <ReceiptText className="w-5 h-5" />
            Invoice Summary
          </h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{afterDiscAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between">
              <span>You saved</span>
              <Badge variant="success" className="flex items-center gap-1">
                <HandCoins className="h-3 w-auto" />
                {(totalAmount - afterDiscAmount).toFixed(2)}
              </Badge>
            </div>
            <div className="flex justify-between font-semibold border-t pt-2">
              <span>Total</span>
              <span>₹{afterDiscAmount.toFixed(2)}</span>
            </div>
          </div>
          {authUser?.isLoginnedIn ? (
            !authUser.isProfileCompleted && <Banner />
          ) : (
            <Banner
              title="Login Required"
              description="You need to be logged in to access this page."
              linkHref="/login"
              linkText="Login Now"
              variant="info"
              onClick={() => openModal("login")}
            />
          )}
          {/* <Link
            href={{
              pathname: "/payment",
              query: { amount: afterDiscAmount.toFixed(2) },
            }}
            onClick={handleClick}
          > */}
            {/* <Button
              className="mt-6 w-full flex items-center gap-2"
              disabled={isDisabled}
               onClick={onClickPlaceOrder}
            >
              <PackageCheck className="w-4 h-4" />
              Place Order
            </Button> */}
           <PayButton cart={cart.map(item => ({ ...item, price: Number(item.price) }))} selectedItems={selectedItems} />

          {/* </Link> */}
        </div>
      )}
    </div>
  );
}
