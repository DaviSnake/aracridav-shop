"use client";

import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { CreateOrderData, CreateOrderActions, OnApproveData, OnApproveActions } from "@paypal/paypal-js";
import { paypalCheckPayment, setTransactionId } from "@/actions";

interface Props {
  orderId: string;
  amount: number;
}

export const PayPalButton = async ({ orderId, amount }: Props) => {

    const [{ isPending }] = usePayPalScriptReducer();

    if ( isPending ) {
        return (
          <div className="animate-pulse">
            <div className="h-10 bg-gray-300 rounded" />
            <div className="h-10 bg-gray-300 rounded mt-2" />
          </div>
        );
      }


      const createOrder = async(data: CreateOrderData, actions: CreateOrderActions): Promise<string> => {

        const transactionId = "342423354553";

        // const transactionId = await actions.order.create({
        //   purchase_units: [
        //     {
        //       amount: {
        //         value: '100',
        //       }    
        //     }
        //   ]
        // });
    
        const { ok } = await setTransactionId( orderId, transactionId );
        if ( !ok ) {
          throw new Error('No se pudo actualizar la orden');
        }

        return transactionId;
      }

      const onApprove = async(data: OnApproveData, actions: OnApproveActions) => {

        const details = await actions.order?.capture();
        if ( !details ) return;

        await paypalCheckPayment( details.id)

      }
  

  return <PayPalButtons 
    createOrder={ createOrder }
    onApprove={ onApprove }
  />
};
