/*
  Warnings:

  - You are about to drop the column `audioPath` on the `EvidenceRecord` table. All the data in the column will be lost.
  - You are about to drop the column `photoPath` on the `EvidenceRecord` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EvidenceRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "photoFile" TEXT,
    "audioFile" TEXT,
    "lat" REAL,
    "lng" REAL,
    "timestamp" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_EvidenceRecord" ("createdAt", "id", "lat", "lng", "timestamp", "token") SELECT "createdAt", "id", "lat", "lng", "timestamp", "token" FROM "EvidenceRecord";
DROP TABLE "EvidenceRecord";
ALTER TABLE "new_EvidenceRecord" RENAME TO "EvidenceRecord";
CREATE UNIQUE INDEX "EvidenceRecord_token_key" ON "EvidenceRecord"("token");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
