/*
  Warnings:

  - You are about to drop the column `movie_id` on the `watch_history` table. All the data in the column will be lost.
  - You are about to drop the `_genre_movie` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `genre` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `movies` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[user_id,tmdb_id]` on the table `watch_history` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tmdb_id` to the `watch_history` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_genre_movie" DROP CONSTRAINT "_genre_movie_A_fkey";

-- DropForeignKey
ALTER TABLE "_genre_movie" DROP CONSTRAINT "_genre_movie_B_fkey";

-- DropForeignKey
ALTER TABLE "watch_history" DROP CONSTRAINT "watch_history_movie_id_fkey";

-- DropIndex
DROP INDEX "watch_history_user_id_movie_id_key";

-- AlterTable
ALTER TABLE "watch_history" DROP COLUMN "movie_id",
ADD COLUMN     "tmdb_id" INTEGER NOT NULL;

-- DropTable
DROP TABLE "_genre_movie";

-- DropTable
DROP TABLE "genre";

-- DropTable
DROP TABLE "movies";

-- CreateIndex
CREATE UNIQUE INDEX "watch_history_user_id_tmdb_id_key" ON "watch_history"("user_id", "tmdb_id");
