'use server';

import { auth } from "@/auth.config";
import type{ Address, Size } from "@/interfaces";
import prisma from "@/lib/prisma";
import { count } from "console";

interface ProductToOrder {

    productId: string;
    quantity: number;
    size: Size;
}


export const placeOrder = async( productIds: ProductToOrder[], addrees: Address) => {

    const session = await auth();
    const userId = session?.user.id;

    //Verificar sesion de usuario.
    if ( !userId ) {
        return {
            ok: false,
            message: "No hay sesión de usuario"
        }
    }

    //Obtenr las informacion de los productos 
    //Nota: Podemos llevar 2 o mas productos con el mismo id
    const products = await prisma.product.findMany({
        where: {
            id: {
                in: productIds.map( p => p.productId)
            }
        }
    });

   //Carcular los montos, Encabezado
   const itemsInOrder = productIds.reduce( (count, p ) => count + p.quantity, 0 );

   console.log(itemsInOrder);


   


}