/*
  Warnings:

  - You are about to drop the column `movie_id` on the `watch_progress` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id,tmdb_id]` on the table `watch_progress` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tmdb_id` to the `watch_progress` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "watch_progress_user_id_movie_id_key";

-- AlterTable
ALTER TABLE "watch_progress" DROP COLUMN "movie_id",
ADD COLUMN     "tmdb_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "watch_progress_user_id_tmdb_id_key" ON "watch_progress"("user_id", "tmdb_id");
