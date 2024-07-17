-- CreateTable
CREATE TABLE "CartProduct" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "size" "Size" NOT NULL,
    "image" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL,

    CONSTRAINT "CartProduct_pkey" PRIMARY KEY ("id")
);
