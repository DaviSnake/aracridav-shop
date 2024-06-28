'use server';

import { auth } from "@/auth.config";
import type { Address, Size } from "@/interfaces";
import prisma from "@/lib/prisma";
import { count } from "console";

interface ProductToOrder {

    productId: string;
    quantity: number;
    size: Size;
}


export const placeOrder = async (productIds: ProductToOrder[], address: Address) => {

    const session = await auth();
    const userId = session?.user.id;

    //Verificar sesion de usuario.
    if (!userId) {
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
                in: productIds.map(p => p.productId)
            }
        }
    });

    //Carcular los montos, Encabezado
    const itemsInOrder = productIds.reduce((count, p) => count + p.quantity, 0);

    // Los Totales de tax, subtotal y total
    const { subTotal, impuesto, total } = productIds.reduce((totals, item) => {

        const productQuantity = item.quantity;
        const product = products.find(product => product.id === item.productId);

        if (!product) throw new Error(`${item.productId} no existe - 500`);

        const subTotal = product.price * productQuantity;

        totals.subTotal += subTotal;
        totals.impuesto += subTotal * 0.19;
        totals.total += subTotal * 1.19;

        return totals;
    }, { subTotal: 0, impuesto: 0, total: 0 })

    //Crear la transacción en la BD
    try {

        const prismaTx = await prisma.$transaction(async (tx) => {
            // 1. Actualizar el stock de los productos
            const updatedProducstPromises = products.map((product) => {

                //Acumular los valores
                const productQuantity = productIds.filter(
                    p => p.productId === product.id
                ).reduce((acc, item) => item.quantity + acc, 0);

                if (productQuantity === 0) {
                    throw new Error(`${product.id}, no tiene la cantidad referida`);
                }


                return tx.product.update({
                    where: { id: product.id },
                    data: {
                        inStock: {
                            decrement: productQuantity
                        }
                    }
                })
            })

            const updatedProducts = await Promise.all(updatedProducstPromises);

            //Verificar valores negativos en las existencias
            updatedProducts.forEach(product => {
                if (product.inStock < 0) {
                    throw new Error(`${product.title}, no tiene inventario suficiente`);
                }

            })



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
                            data: productIds.map(p => ({
                                quantity: p.quantity,
                                productId: p.productId,
                                size: p.size,
                                price: products.find(product => product.id === p.productId)?.price ?? 0
                            }))
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
                updatedProducts: updatedProducts,
                order: order,
                orderAddress: orderAddress,

            }
        });

        return {
            ok: true,
            order: prismaTx.order,
            prismaTx: prismaTx,
        }

    } catch (error: any) {
        return {
            ok: false,
            message: error?.message
        }
    }








}