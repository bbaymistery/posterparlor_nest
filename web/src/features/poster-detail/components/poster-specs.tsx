"use client";

import { useState } from "react";
import { Poster } from "@/store/api/inventory.api";
import { useAppDispatch, useAppSelector } from "@/store";

import { addToCart } from "@/store/slices/cart.slice";
import { ShoppingBag, Minus, Plus, ShieldCheck, Truck, RefreshCw, Check, PackageX } from "lucide-react";
import { toast } from "sonner";

interface PosterSpecsProps {
  poster: Poster;
}

export function PosterSpecs({ poster }: PosterSpecsProps) {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const [quantity, setQuantity] = useState(1);

  const primaryImage =
    poster.images && poster.images.length > 0
      ? poster.images[0].url
      : "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80";

  const existingCartItem = cartItems.find(
    (item) => item.posterId === poster._id
  );
  const currentCartQty = existingCartItem ? existingCartItem.quantity : 0;
  const remainingStock = Math.max(0, poster.stock - currentCartQty);

  const handleAddToCart = () => {
    if (!poster.isAvailable || poster.stock <= 0) {
      toast.error("This poster is currently out of stock.");
      return;
    }

    if (currentCartQty >= poster.stock) {
      toast.info(
        `You already have the maximum available stock (${poster.stock}) in your cart!`
      );
      return;
    }

    if (currentCartQty + quantity > poster.stock) {
      const allowedAdd = poster.stock - currentCartQty;
      dispatch(
        addToCart({
          _id: poster._id,
          posterId: poster._id,
          title: poster.title,
          price: poster.price,
          imageUrl: primaryImage,
          stock: poster.stock,
          quantity: allowedAdd,
          dimensions: poster.dimensions || "24 x 36 inches",
          material: "250 GSM Premium Matte",
        })
      );
      toast.info(
        `Added ${allowedAdd} items to reach maximum available stock (${poster.stock}).`
      );
      return;
    }

    dispatch(
      addToCart({
        _id: poster._id,
        posterId: poster._id,
        title: poster.title,
        price: poster.price,
        imageUrl: primaryImage,
        stock: poster.stock,
        quantity: quantity,
        dimensions: poster.dimensions || "24 x 36 inches",
        material: "250 GSM Premium Matte",
      })
    );

    toast.success(`Added ${quantity} x "${poster.title}" to cart!`);
  };


  return (
    <div className="flex flex-col gap-6">
      {/* Category & Title */}
      <div>
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20 mb-3">
          {poster.category}
        </span>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
          {poster.title}
        </h1>
      </div>

      {/* Price & Availability */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/40 border border-border/40">
        <div>
          <span className="text-xs text-muted-foreground uppercase font-semibold block">
            Unit Price
          </span>
          <span className="text-3xl font-black text-amber-500 font-mono">
            ${poster.price.toFixed(2)}
          </span>
        </div>

        <div>
          {poster.isAvailable && poster.stock > 0 ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Check className="h-4 w-4" /> In Stock ({poster.stock} items)
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <PackageX className="h-4 w-4" /> Out of Stock
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
          Description
        </h3>
        <p className="text-sm text-foreground/90 leading-relaxed">
          {poster.description}
        </p>
      </div>

      {/* Specs Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 rounded-xl bg-card border border-border/40 text-xs">
          <span className="text-muted-foreground block font-medium">Dimensions:</span>
          <span className="font-bold text-foreground">{poster.dimensions || "24 x 36 inches"}</span>
        </div>
        <div className="p-3 rounded-xl bg-card border border-border/40 text-xs">
          <span className="text-muted-foreground block font-medium">Print Paper:</span>
          <span className="font-bold text-foreground">250 GSM Premium Matte</span>
        </div>
      </div>

      {/* Tags */}
      {poster.tags && poster.tags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground font-semibold">Tags:</span>
          {poster.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-0.5 rounded-md text-[11px] font-mono bg-secondary text-muted-foreground"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Cart Status Notice (If item already exists in cart) */}
      {currentCartQty > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-400">
          <ShoppingBag className="h-4 w-4 flex-shrink-0" />
          <span>You already have <strong>{currentCartQty}</strong> of this poster in your cart!</span>
        </div>
      )}

      {/* Quantity & Add to Cart */}
      <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-border/40">
        
        {/* Quantity Controls */}
        <div className="flex items-center gap-3 p-1.5 rounded-2xl bg-secondary/60 border border-border/50">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1 || remainingStock <= 0}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="font-mono font-bold text-sm min-w-[24px] text-center">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(Math.min(remainingStock, quantity + 1))}
            disabled={quantity >= remainingStock || remainingStock <= 0}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={!poster.isAvailable || poster.stock <= 0 || remainingStock <= 0}
          className="flex-1 w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-amber-500 text-black font-bold text-sm hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-40 cursor-pointer"
        >
          <ShoppingBag className="h-4 w-4" />
          <span>
            {remainingStock <= 0
              ? "Max Stock in Cart"
              : `Add $${(poster.price * quantity).toFixed(2)} to Cart`}
          </span>
        </button>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-3 gap-3 pt-6 border-t border-border/40 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-amber-500 flex-shrink-0" />
          <span>Fast Shipping</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-500 flex-shrink-0" />
          <span>Secure Stripe Checkout</span>
        </div>
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-purple-400 flex-shrink-0" />
          <span>Quality Guarantee</span>
        </div>
      </div>
    </div>
  );
}
