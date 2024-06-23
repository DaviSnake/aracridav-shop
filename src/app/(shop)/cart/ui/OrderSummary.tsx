'use client'

import { useCartStore } from "@/store";
import { currentFormat } from "@/utils";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

export const OrderSummary = () => {
  
    const [loaded, setLoaded] = useState(false);
    const { subsTotal, impuesto, total, itemsInCart } = useCartStore((state) => state.getSummaryInformation());

    useEffect(() => {
        setLoaded(true);
      }, []);
    
      if (!loaded) {
        return <p>Loadind....</p>;
      }

      if (total === 0) redirect("/empty") 
  
    return (
    <>
      <div className="grid grid-cols-2">
        <span>No. Productos</span>
        <span className="text-right">{ itemsInCart === 1 ? "1 articulo" : `${ itemsInCart } articulos`}</span>

        <span>Subtotal</span>
        <span className="text-right">{ currentFormat(subsTotal) }</span>

        <span>Impuestos (19%)</span>
        <span className="text-right">{ currentFormat(impuesto) }</span>

        <span className="mt-5 text-2xl">Total:</span>
        <span className="mt-5 text-2xl text-right">{ currentFormat(total) }</span>
      </div>
    </>
  );
};
