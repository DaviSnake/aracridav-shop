'use server';

export const transBankPayment = async (orderId: string, amount: number) => {

    const amountRe = Math.round(amount);
    const idComercio = orderId.split("-").at(-1)
    
    //Generar sesionId
    const sessionId = `sesion${Math.round(Math.random() * 10000000000)}`;
    

    try {
        const res = await fetch(process.env.URL_TBK ?? "", {
          method: "POST",
          headers: {
              "Content-type": "application/json",
              "Tbk-Api-Key-Secret": process.env.TBK_API_KEY_SECRET ?? "",
              "Tbk-Api-Key-Id": process.env.TBK_API_KEY_ID ?? ""
          },
          body: JSON.stringify(
            {
              "buy_order": idComercio,
              "session_id": sessionId,
              "amount": amountRe,
              "return_url": process.env.URL_RETORNO + `?orderId=${orderId}`
             }
          )
      })
    
      const data = await res.json()
      return {
        ok: true,
        url: `${data.url}?token_ws=${data.token}`
      }     
    
    } catch (error) {
      console.log(error)
      return {
        ok: false,
        message: "No se pudo realizar el pago de la orden"
      }
    }   
}

