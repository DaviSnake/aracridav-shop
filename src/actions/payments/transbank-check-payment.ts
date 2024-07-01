"use server";

import prisma from "@/lib/prisma";

export const transbankCheckPayment = async (tokenTransbank: string|undefined, orderId: string) => {
  
  const resp = await transbankCheck( tokenTransbank );

  if ( !resp ) {
    return {
      ok: false,
      message: 'Error al verificar el pago'
    }
  }

  const { vci } = await resp.json();
 
  if ( vci !== 'TSY' ) {
    return {
      ok: false,
      message: 'Aún no se ha pagado en TransBank'
    }
  }

  // TODO: Realizar la actualización en nuestra base de datos
  try {

    await prisma.order.update({
      where: { id: orderId },
      data:  {
        isPaid: true,
        paidAt: new Date(),
        transactionId: tokenTransbank
      }
    })

    return {
      ok: true
    }

    
  } catch (error) {
    console.log(error);
    return {
      ok: false,
      message: '500 - El pago no se pudo realizar'
    }
  }
}


const transbankCheck = async ( tokenTransbank: string|undefined ) => {


  const URL = process.env.URL_TBK +"/"+tokenTransbank

  try {
      const res = await fetch(URL, {
        method: "PUT",
        headers: {
            "Content-type": "application/json",
              "Tbk-Api-Key-Secret": process.env.TBK_API_KEY_SECRET ?? "",
              "Tbk-Api-Key-Id": process.env.TBK_API_KEY_ID ?? ""
        }
    })
  
      return res;

    } catch (error) {
      console.log(error)
      return null;
    }
}
