import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { initializePinecone } from '../config/pinecone';
import fs from 'fs';
import path from 'path';
import { Document } from 'langchain/document';
import mongoose from 'mongoose';
import { Order } from "../models";
import { parse } from 'csv-parse/sync';

export class ChatService {
  private static instance: ChatService;
  private vectorstore: PineconeStore | null = null;

  private constructor() {}

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  public async initialize() {
    const pc = initializePinecone();
    const indexName = 'bookstoretest2';  // Define the index name here

    // Check if the index exists, if not, create it
    try {
      const indexList = await pc.listIndexes(); // Assuming this returns an object with an `indexes` property

      if (indexList && Array.isArray(indexList.indexes)) {
        const existingIndexes = indexList.indexes; // Adjust if needed based on actual response structure

        if (!existingIndexes.some(index => index.name === indexName)) {
          await pc.createIndex({
            name: indexName,
            dimension: 1536,  // Number of dimensions in the vector, adjust according to your embeddings model
            metric: 'cosine',  // Metric for similarity search
            spec: { 
              serverless: { 
                cloud: 'aws', 
                region: 'us-east-1' 
              }
            } 
          });
          console.log(`Index ${indexName} created.`);
        } else {
          console.log(`Index ${indexName} already exists.`);
        }
      } else {
        console.error('Failed to retrieve the index list or index list is not an array.');
      }
    } catch (error) {
      console.error('Error checking or creating index:', error);
      throw error;  // Rethrow error to handle it later
    }

    // Initialize embeddings and model
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'text-embedding-ada-002'  // Assuming the library supports this
    });

    const index = pc.Index(indexName);
    this.vectorstore = await PineconeStore.fromExistingIndex(embeddings, { pineconeIndex: index });

    // Load and process CSV
    const csvFilePath = path.resolve(__dirname, '../documents/Bookstore-FAQ.csv');
    const csvData = fs.readFileSync(csvFilePath, 'utf8');

    // Parse CSV data with proper handling of quoted fields
    const records = parse(csvData, {
      columns: true,    // If the first row contains headers, set this to true
      skip_empty_lines: true,
      trim: true         // Trim whitespace around fields
    });

    for (const record of records) {
      const [id, question, answer] = record;

      if (question && answer) {
        // const embeddedText = await embeddings.embedQuery(question);
        const document = new Document({
          pageContent: question.trim(),
          metadata: {
            id: id.trim(),
            answer: answer.trim(),
          },
        });

        // Store the vector along with the document
        await this.vectorstore!.addDocuments([document]);
      }
    }
  }

  public async processMessage(message: string, userId?:string): Promise<string> {
    if (!this.vectorstore) {
      throw new Error('Chat service not initialized');
    }

    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'text-embedding-ada-002'  // Assuming the library supports this
    });
    const queryVector = await embeddings.embedQuery(message);

    // Query the vector store for the most similar documents
    const results = await this.vectorstore!.similaritySearchVectorWithScore(queryVector, 1);

    if (results.length > 0) {
      const bestMatch = results[0][0]; // The best matching document
      if ( bestMatch.metadata.answer.trim().includes('check-orders')){
        return await this.handleOrderQuery(userId || "");
      }else{
        return bestMatch.metadata.answer; // Return the answer from the metadata
      }
      
    } else {
      return "Sorry, I couldn't find an answer to that question.";
    }
  }

  private async handleOrderQuery(userId: string): Promise<string> {

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return "Please login to check your orders.";
    }

    const orders = await Order.find({ userId }).exec();

    if (orders.length > 0) {
      const oneOrderMessage = `You have ${orders.length} order. The order is ${orders[0].status}. Click<a href='FRONTEND_URL/orders'> here </a>to check your order.`;
      const multipleOrdersMessage = `You have ${orders.length} orders. The latest order is ${orders[0].status}. Click<a href='FRONTEND_URL/orders'> here </a>to see the list.`
      return orders.length == 1 ? oneOrderMessage : multipleOrdersMessage;
    } else {
      return "You have no orders.";
    }
  }
}
