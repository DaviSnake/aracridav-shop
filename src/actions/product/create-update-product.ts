'use server';

import { Size } from "@/interfaces";
import prisma from "@/lib/prisma";
import { Gender, Product } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { v2 as cloudinary } from 'cloudinary';
cloudinary.config( process.env.CLOUDINARY_URL ?? "" );


const productSchema = z.object({
    id: z.string().uuid().optional().nullable(),
    title: z.string().min(3).max(255),
    slug: z.string().min(3).max(255),
    description: z.string(),
    price: z.coerce
    .number()
    .min(0)
    .transform( val => Number(val.toFixed(0)) ),
    inStock: z.coerce
    .number()
    .min(0)
    .transform( val => Number(val.toFixed(0)) ),
    categoryId: z.string().uuid(),
    sizes: z.coerce.string().transform( val => val.split(",") ),
    tags: z.string(),
    gender: z.nativeEnum(Gender),
})

export const createUpdateProduct = async( formData: FormData ) => {

    const data = Object.fromEntries( formData );
    const productParsed = productSchema.safeParse( data );

    if ( !productParsed.success ){
        console.log(productParsed.error);
        return { ok: false };
    }
    
    const product = productParsed.data;
    product.slug = product.slug.toLowerCase().replace(/ /g, '-').trim();

    const { id, ...rest } = product;

    try {
        const prismaTx = await prisma.$transaction( async(tx) => {
    
            let product: Product;
            const tagsArray = rest.tags.split(",").map( tag => tag.trim().toLowerCase() )
    
            if ( id ){
                //Actualiar
                product = await prisma.product.update({
                    where: { id },
                    data: {
                        ...rest,
                        sizes: {
                            set: rest.sizes as Size[],
                        },
                        tags: tagsArray
                    }
                });
    
    
            } else {
                //Crear
                product = await prisma.product.create({
                    data: {
                        ...rest,
                        sizes: {
                            set: rest.sizes as Size[],
                        },
                        tags: {
                            set: tagsArray
                        }
                    }
                });
            }
    
            //Proceso de carga y guardado de imagenes
            //Recorrer las imagenes y guardarlas
            if ( formData.getAll("images") ){
                //
                const images = await uploadImages(formData.getAll("images") as File[]);
                console.log(images);
            }
    
    
            return {
                product
            }
    
    
        } ); 


        //Revalidate Paths
        revalidatePath("/admin/product");
        revalidatePath(`/admin/product/${ product.slug }`);
        revalidatePath(`/product/${ product.slug }`);
        
        return {
            ok: true,
            product: prismaTx.product,
        }
    } catch (error) {
        return {
            ok: false,
            message: "Revisar los logs, no se pudo actualizar/crear"
        }
    }  


};


const uploadImages = async( images: File[] ) => {

    try {

        const uploadPromises = images.map( async( image ) => {
            try {
                const buffer = await image.arrayBuffer();
                const base64Image = Buffer.from(buffer).toString("base64");
    
                return cloudinary.uploader.upload(`data:image/png;base64,${ base64Image }`)
                    .then( r => r.secure_url );                
            } catch (error) {
                console.log(error);
                return null;
            }
        });

        const uplodedImages = await Promise.all( uploadPromises );
        return uplodedImages;
        


    } catch (error) {
        console.log(error);
        return null;
    }

}