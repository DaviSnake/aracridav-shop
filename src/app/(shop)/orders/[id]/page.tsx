'use server'

import { PayPalButton, Title, TransBankButton } from "@/components";
import Image from "next/image";
import { getOrderById } from "@/actions";
import { redirect } from "next/navigation";
import { currentFormat } from "@/utils";
import { OrderStatus } from "@/components/orders/OrderStatus";

interface Props {
  params: {
    id: string;
  };
}

export default async function OrdersByIdPage({ params }: Props) {
  const { id } = params;

  //Llamar al server action
  const { ok, order } = await getOrderById(id);

  if (!ok) {
    redirect("/");
  }

  const address = order!.OrderAddress;

  return (
    <div className="flex justify-center items-center mb-72 px-10 sm:px-0">
      <div className="flex flex-col w-[1000px]">
        <Title title={`Orden #${id.split("-").at(-1)}`} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
          {/* Carrito */}
          <div className="flex flex-col mt-5">
            <OrderStatus 
              isPaid={ order!.isPaid }
            />

            {/* Items */}
            {order!.OrderItem.map((item) => (
              <div
                key={item.product.slug + "-" + item.size}
                className="flex mb-5"
              >
                <Image
                  src={`/products/${item.product.ProductImage[0].url}`}
                  width={100}
                  height={100}
                  style={{
                    width: "100px",
                    height: "100px",
                  }}
                  alt={item.product.title}
                  className="mr-5 rounded"
                />

                <div>
                  <p>{item.product.title}</p>
                  <p>
                    {currentFormat(item.price)} x {item.quantity}
                  </p>
                  <p className="font-bold">
                    Subtotal: {currentFormat(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout - Resumen de orden */}
          <div className="bg-white rounded-xl shadow-xl p-7">
            <h2 className="text-2xl mb-2">Dirección de entrega</h2>
            <div className="mb-10">
              <p className="text-xl">
                {address!.firstName} {address!.lastName}
              </p>
              <p>{address!.address}</p>
              <p>{address!.address2}</p>
              <p>{address!.postalCode}</p>
              <p>
                {address!.city}, {address!.countryId}
              </p>
              <p>{address!.phone} </p>
            </div>

            {/* Divider */}
            <div className="w-full h-0.5 rounded bg-gray-200 mb-10" />

            <h2 className="text-2xl mb-2">Resumen de orden</h2>

            <div className="grid grid-cols-2">
              <span>No. Productos</span>
              <span className="text-right">
                {order!.itemsInOrder === 1
                  ? "1 articulo"
                  : `${order!.itemsInOrder} articulos`}
              </span>

              <span>Subtotal</span>
              <span className="text-right">
                {currentFormat(order!.subTotal)}
              </span>

              <span>Impuestos (19%)</span>
              <span className="text-right">{currentFormat(order!.tax)}</span>

              <span className="mt-5 text-2xl">Total:</span>
              <span className="mt-5 text-2xl text-right">
                {currentFormat(order!.total)}
              </span>
            </div>

            <div className="mt-5 mb-2 w-full">
              {
                order!.isPaid 
                ? (
                  <OrderStatus 
                  isPaid={ order!.isPaid }
                />
                ) : (

                  // <PayPalButton
                  //   amount={ order!.total }
                  //   orderId={ order!.id } 
                  // />
                  <TransBankButton 
                    amount={ order!.total }
                    orderId={ order!.id } 
                  />

                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
