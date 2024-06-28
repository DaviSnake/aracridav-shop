import { CartProduct } from "@/interfaces";
import { create } from "zustand";
import { persist } from "zustand/middleware";



interface State {

    cart: CartProduct[];

    getTotalItems: () => number;
    getSummaryInformation: () => {
        subsTotal: number;
        impuesto: number;
        total: number;
        itemsInCart: number;
    };

    addProducToCart: (product: CartProduct) => void;
    updateProductQuantity: (product: CartProduct, quantity: number) => void;
    removeProduct: (product: CartProduct) => void;

    clearCart: () => void;
    

}

export const useCartStore = create<State>()(

    persist(
        (set, get) => ({

            cart: [],

            //Methods

            getTotalItems: () => {

                const { cart } = get();

                return cart.reduce( ( total, item ) => total + item.quantity, 0 );

            },

            getSummaryInformation: () => {
                const { cart } = get();

                const subsTotal = cart.reduce(
                    (subsTotal, product) => (product.quantity * product.price) + subsTotal,
                    0 
                );

                const impuesto = subsTotal * 0.19;
                const total = subsTotal + impuesto;
                const itemsInCart = cart.reduce( ( total, item ) => total + item.quantity, 0 );

                return {
                    subsTotal, impuesto, total, itemsInCart
                }

            },

            addProducToCart: (product: CartProduct) => {
                const { cart } = get();

                //1. Revisar el producto si existe en el carrito con la talla seleccionada
                const productInCart = cart.some(
                    (item) => item.id === product.id && item.size === product.size
                );

                if (!productInCart) {
                    set({ cart: [...cart, product] });
                    return;
                }

                //2. Se que el producto existe por talla, hay que incrementarlo
                const updateCartProducts = cart.map((item) => {
                    if (item.id === product.id && item.size === product.size) {
                        return { ...item, quantity: item.quantity + product.quantity }
                    }

                    return item;
                });

                set({ cart: updateCartProducts })


            },

            updateProductQuantity: (product: CartProduct, quantity: number) => {
                const { cart } = get();

                const updatedCartProducts = cart.map( item => {
                    if ( item.id === product.id && item.size === product.size ){
                        return { ...item, quantity: quantity };
                    }

                    return item;
                })

                set({ cart: updatedCartProducts });
            },

            removeProduct: (product: CartProduct) => {
                const { cart } = get();

                const updatedCartProducts = cart.filter(
                    item => item.id !== product.id || item.size !== product.size
                );
                
                set({ cart: updatedCartProducts });

                
                
            },

            clearCart: () => {
                set({ cart: [] })
            },

        })
        , {
            name: 'shopping-cart',
        }
    )

)