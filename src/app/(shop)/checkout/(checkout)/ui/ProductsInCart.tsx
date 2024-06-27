"use client";

import { useCartStore } from "@/store";
import { currentFormat } from "@/utils";
import Image from "next/image";
import { useEffect, useState } from "react";

export const ProductsInCart = () => {
  const [loaded, setLoaded] = useState(false);

  const productsInCart = useCartStore((state) => state.cart);
  

  useEffect(() => {
    setLoaded(true);
  }, []);

  if (!loaded) {
    return <p>Cargando....</p>;
  }

  return (
    <>
      { productsInCart.map((product) => (
        <div key={`${product.slug}-${product.size}`} className="flex mb-5">
          <Image
            src={`/products/${product.image}`}
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
            <span>
              {product.size} - {product.title} ({ product.quantity })
            </span>
            <div className="grid grid-cols-2">
              <span className="text-left">Precio</span>
              <span className="text-right font-bold">{ currentFormat(product.price * product.quantity) }</span>
            </div>
           
          </div>
        </div>
      )) }
    </>
  );
};
