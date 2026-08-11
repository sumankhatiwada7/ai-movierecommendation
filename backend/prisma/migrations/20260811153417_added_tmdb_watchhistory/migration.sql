/*
  Warnings:

  - A unique constraint covering the columns `[tmdb_id]` on the table `movies` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tmdb_id` to the `movies` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "movies" ADD COLUMN     "backdrop_url" TEXT,
ADD COLUMN     "tmdb_id" INTEGER NOT NULL,
ADD COLUMN     "trailer_key" TEXT;

-- CreateTable
CREATE TABLE "watch_history" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "movie_id" INTEGER NOT NULL,
    "watched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "watch_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "watch_history_user_id_idx" ON "watch_history"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "watch_history_user_id_movie_id_key" ON "watch_history"("user_id", "movie_id");

-- CreateIndex
CREATE UNIQUE INDEX "movies_tmdb_id_key" ON "movies"("tmdb_id");

-- AddForeignKey
ALTER TABLE "watch_history" ADD CONSTRAINT "watch_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watch_history" ADD CONSTRAINT "watch_history_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
