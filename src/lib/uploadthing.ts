// src/lib/uploadthing.ts
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  portfolioPhotos: f({ image: { maxFileSize: "8MB", maxFileCount: 10 } })
    .onUploadComplete(async ({ metadata, file }) => {
      // file.url é a URL pública da imagem
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;