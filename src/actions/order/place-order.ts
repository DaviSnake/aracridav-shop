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


export const placeOrder = async( productIds: ProductToOrder[], address: Address) => {

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

  // Los Totales de tax, subtotal y total
  const { subTotal, impuesto, total } = productIds.reduce( (totals, item) => {

    const productQuantity = item.quantity;
    const product = products.find( product => product.id === item.productId );

    if ( !product ) throw new Error(`${ item.productId } no existe - 500`);

    const subTotal = product.price * productQuantity;

    totals.subTotal += subTotal;
    totals.impuesto += subTotal * 0.19;
    totals.total += subTotal * 1.19;

    return totals;
  }, { subTotal: 0, impuesto: 0, total: 0 } )

  //Crear la transacción en la BD
  const prismaTx = await prisma.$transaction( async(tx) => {
    // 1. Actualizar el stock de los productos


    // 2. Crear la orden - encabezado - detalle
    const order = await tx.order.create({
        data: {
            userId: userId,
            itemsInOrder: itemsInOrder,
            subTotal: subTotal,
            tax: impuesto,
            total: total,

            OrderItem: {
                createMany: {
                    data: productIds.map( p => ({
                        quantity: p.quantity,
                        productId: p.productId,
                        size: p.size,
                        price: products.find( product => product.id === p.productId )?.price ?? 0
                    }) )
                }
            },
        }
    })



    // 3. Crear la dirección de la orden
    const { country, ...restAddress } = address;
    //console.log({address})
    const orderAddress = await tx.orderAddress.create({
        data: {
            firstName: restAddress.firstName,
            lastName: restAddress.lastName,
            address: restAddress.address,
            address2: restAddress.address2,
            postalCode: restAddress.postalCode,
            city: restAddress.city,
            phone: restAddress.phone,
            countryId: country,
            orderId: order.id,
        }
    })

    return {
        updatedProducts: [],
        order: order,
        orderAddress: orderAddress,

    }
  } );





}