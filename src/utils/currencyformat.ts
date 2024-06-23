


export const currentFormat = ( value: number ) => {

    return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format( value )

}