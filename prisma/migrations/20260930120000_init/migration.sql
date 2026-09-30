-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL,
    "photoUrl" TEXT,
    "conjunto" TEXT NOT NULL,
    "subconjunto" TEXT NOT NULL,
    "linha" TEXT NOT NULL,
    "equipamento" TEXT NOT NULL,
    "codigoSap" TEXT NOT NULL,
    "descricaoTecnica" TEXT NOT NULL,
    "funcaoSubconjunto" TEXT NOT NULL,
    "qrIdentifier" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_codigoSap_key" ON "Equipment"("codigoSap");

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_qrIdentifier_key" ON "Equipment"("qrIdentifier");

