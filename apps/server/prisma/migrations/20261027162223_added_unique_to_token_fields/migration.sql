/*
  Warnings:

  - A unique constraint covering the columns `[key]` on the table `Token` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[token]` on the table `Token` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Token_key_key" ON "Token"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Token_token_key" ON "Token"("token");
