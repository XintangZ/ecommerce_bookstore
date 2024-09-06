import { Pinecone } from "@pinecone-database/pinecone";

export const initializePinecone = () => {
  return new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });
};