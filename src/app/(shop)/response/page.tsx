import { transbankCheckPayment } from "@/actions";
import { auth } from "@/auth.config";
import { Title } from "@/components";
import { redirect } from "next/navigation";


interface Props {
  searchParams: {
    orderId: string;
    token_ws: string; 
  }
}


export default async function ResponsePage({ searchParams }: Props) {
      
    const session = await auth();

    const { orderId, token_ws } = searchParams;
  
    if (!session?.user) {
      redirect("/");
    }

    const data = await transbankCheckPayment( token_ws, orderId );

    if ( data.ok ){
      setTimeout(redirect(`orders/${orderId}`),20000);
    }
 
    return (
      <div>
        <Title title="Perfil" />
  
        <pre>Hola Mundo</pre>
  
        <h3 className="text-3xl mb-10">Hola Mundo </h3>
      </div>
    );
  }