-- CreateEnum
CREATE TYPE "BlockType" AS ENUM ('PARAGRAPH', 'HEADING_1', 'HEADING_2', 'HEADING_3', 'QUOTE', 'CODE', 'UNORDERED_LIST', 'ORDERED_LIST', 'IMAGE', 'DIVIDER');

-- CreateEnum
CREATE TYPE "TextAlign" AS ENUM ('LEFT', 'CENTER', 'RIGHT', 'JUSTIFY');

-- CreateEnum
CREATE TYPE "FontFamily" AS ENUM ('ARIAL', 'TIMES_NEW_ROMAN', 'COURIER_NEW', 'GEORGIA', 'VERDANA', 'CALIBRI');

-- CreateTable
CREATE TABLE "ArticleBlock" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "type" "BlockType" NOT NULL,
    "content" TEXT NOT NULL,
    "fontSize" INTEGER NOT NULL DEFAULT 16,
    "fontFamily" "FontFamily" NOT NULL DEFAULT 'ARIAL',
    "textAlign" "TextAlign" NOT NULL DEFAULT 'LEFT',
    "textColor" TEXT DEFAULT '#000000',
    "backgroundColor" TEXT,
    "isBold" BOOLEAN NOT NULL DEFAULT false,
    "isItalic" BOOLEAN NOT NULL DEFAULT false,
    "isUnderline" BOOLEAN NOT NULL DEFAULT false,
    "isStrikethrough" BOOLEAN NOT NULL DEFAULT false,
    "listItemLevel" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "imageAlt" TEXT,
    "imageWidth" INTEGER,
    "imageHeight" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArticleBlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ArticleBlock_articleId_idx" ON "ArticleBlock"("articleId");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleBlock_articleId_order_key" ON "ArticleBlock"("articleId", "order");

-- AddForeignKey
ALTER TABLE "ArticleBlock" ADD CONSTRAINT "ArticleBlock_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
