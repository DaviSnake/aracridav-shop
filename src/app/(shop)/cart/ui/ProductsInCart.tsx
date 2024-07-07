"use client";

import { ProductImage, QuantitySelector } from "@/components";
import { useCartStore } from "@/store";
import { currentFormat } from "@/utils";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export const ProductsInCart = () => {
  const [loaded, setLoaded] = useState(false);

  const productsInCart = useCartStore((state) => state.cart);
  const removeProductQuantity = useCartStore((state) => state.removeProduct);
  const updateProductQuantity = useCartStore(
    (state) => state.updateProductQuantity
  );

  useEffect(() => {
    setLoaded(true);
  }, []);

  if (!loaded) {
    return <p>Loadind....</p>;
  }

  return (
    <>
      { productsInCart.map((product) => (
        <div key={`${product.slug}-${product.size}`} className="flex mb-5">
          <ProductImage
            src={ product.image }
            width={100}
            height={100}
            style={{
              width: "100px",
              height: "100px",
            }}
            alt={product.title}
            className="mr-5 rounded"
          />

          <div>
            <Link
              className="hover:underline cursor-pointer"
              href={`/product/${product.slug}`}
            >
              {product.size} - {product.title}
            </Link>
            <div className="grid grid-cols-2">
              <span className="text-left">Precio</span>
              <span className="text-right font-bold">{ currentFormat(product.price) }</span>
            </div>
            <QuantitySelector
              quantity={product.quantity}
              onQuantityChange={(quantity) =>
                updateProductQuantity(product, quantity)
              }
            />

            <button 
            onClick={ () => removeProductQuantity(product) }
            className="underline mt-3">Remover</button>
          </div>
        </div>
      )) }
    </>
  );
};
