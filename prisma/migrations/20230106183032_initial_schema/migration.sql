/*
  Warnings:

  - You are about to alter the column `publicKey` on the `Credential` table. The data in that column could be lost. The data in that column will be cast from `String` to `Binary`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Credential" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "name" TEXT,
    "externalId" TEXT NOT NULL,
    "publicKey" BLOB NOT NULL,
    "signCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Credential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Credential" ("createdAt", "externalId", "id", "name", "publicKey", "signCount", "updatedAt", "userId") SELECT "createdAt", "externalId", "id", "name", "publicKey", "signCount", "updatedAt", "userId" FROM "Credential";
DROP TABLE "Credential";
ALTER TABLE "new_Credential" RENAME TO "Credential";
CREATE UNIQUE INDEX "Credential_externalId_key" ON "Credential"("externalId");
CREATE UNIQUE INDEX "Credential_publicKey_key" ON "Credential"("publicKey");
CREATE INDEX "Credential_externalId_idx" ON "Credential"("externalId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
