import { HumanMessage, MessageContent, SystemMessage } from '@langchain/core/messages';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { PineconeStore } from '@langchain/pinecone';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import { Document } from 'langchain/document';
import mongoose from 'mongoose';
import path from 'path';
import { initializePinecone } from '../config/pinecone';
import { Book, Order } from '../models';

export class ChatService {
	private static instance: ChatService;
	private vectorstore: PineconeStore | null = null;
	private chat: ChatOpenAI;
	private intentClassifier: ChatOpenAI;

	private constructor() {
		this.chat = new ChatOpenAI({ modelName: 'gpt-3.5-turbo' });
		this.intentClassifier = new ChatOpenAI({ modelName: 'gpt-3.5-turbo' });
	}

	public static getInstance(): ChatService {
		if (!ChatService.instance) {
			ChatService.instance = new ChatService();
		}
		return ChatService.instance;
	}

	public async initialize() {
		const pc = initializePinecone();
		const indexName = 'bookstoretest2';

		try {
			const indexList = await pc.listIndexes();
			if (indexList && Array.isArray(indexList.indexes)) {
				const existingIndexes = indexList.indexes;
				if (!existingIndexes.some(index => index.name === indexName)) {
					await pc.createIndex({
						name: indexName,
						dimension: 1536,
						metric: 'cosine',
						spec: {
							serverless: {
								cloud: 'aws',
								region: 'us-east-1',
							},
						},
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
			throw error;
		}

		const embeddings = new OpenAIEmbeddings({
			openAIApiKey: process.env.OPENAI_API_KEY,
			modelName: 'text-embedding-ada-002',
		});

		const index = pc.Index(indexName);
		this.vectorstore = await PineconeStore.fromExistingIndex(embeddings, { pineconeIndex: index });

		await this.loadFAQData();
	}

	private async loadFAQData() {
		const csvFilePath = path.resolve(__dirname, '../documents/Bookstore-FAQ.csv');
		const csvData = fs.readFileSync(csvFilePath, 'utf8');

		const records = parse(csvData, {
			columns: true,
			skip_empty_lines: true,
			trim: true,
		});

		for (const record of records) {
			const { id_num, question, answer } = record;

			if (question && answer) {
				const document = new Document({
					pageContent: question.trim(),
					metadata: {
						id: id_num.trim(),
						answer: answer.trim(),
					},
				});

				await this.vectorstore!.addDocuments([document]);
			}
		}
	}

	private async classifyIntentAndExtractEntities(message: string): Promise<{ intent: string; entities: any }> {
		const systemMessage = `You are an AI assistant tasked with classifying user intents and extracting relevant entities from messages in a bookstore context. 
    Possible intents include: check_book_availability, check_order_status, general_inquiry.
    Possible entities include: bookTitle, authorName, orderNumber.
    Respond with a JSON object containing the classified intent and extracted entities.`;

		const response = await this.intentClassifier.invoke([
			new SystemMessage(systemMessage),
			new HumanMessage(message),
		]);

		try {
			const result = JSON.parse(response.content as string);
			return {
				intent: result.intent,
				entities: result.entities,
			};
		} catch (error) {
			console.error('Error parsing intent classification result:', error);
			return {
				intent: 'general_inquiry',
				entities: {},
			};
		}
	}

	public async processMessage(
		message: string,
		userId?: string,
		conversationHistory: string[] = []
	): Promise<MessageContent> {
		if (!this.vectorstore) {
			throw new Error('Chat service not initialized');
		}

		const { intent, entities } = await this.classifyIntentAndExtractEntities(message);

		let context = '';
		switch (intent) {
			case 'check_book_availability':
				if (entities.bookTitle) {
					return await this.checkBookAvailability(entities.bookTitle);
				} else {
					context =
						"I understand you're asking about book availability, but I couldn't identify which book. Can you please provide the title?";
				}
				break;
			case 'check_order_status':
				return this.handleOrderQuery(userId || '');
			case 'general_inquiry':
				const embeddings = new OpenAIEmbeddings({
					openAIApiKey: process.env.OPENAI_API_KEY,
					modelName: 'text-embedding-ada-002',
				});
				const queryVector = await embeddings.embedQuery(message);
				const results = await this.vectorstore.similaritySearchVectorWithScore(queryVector, 3);
				if (results.length > 0) {
					context = results
						.map(([doc, _score]) => `Q: ${doc.pageContent}\nA: ${doc.metadata.answer}`)
						.join('\n\n');
				}
				break;
			default:
				context = "I'm not sure I understand what you're asking. Could you please rephrase your question?";
		}

		const systemMessage = `You are a helpful assistant for a bookstore. Use the following information to answer the user's question, but feel free to expand on it if necessary: ${context}
    
    If the user asks about checking orders, respond with "check-orders" exactly.
    If you don't know the answer, politely say so and offer to help with something else.
    Conversation history: ${conversationHistory.join('\n')}`;

		const response = await this.chat.invoke([new SystemMessage(systemMessage), new HumanMessage(message)]);

		return response.content;
	}

	private async handleOrderQuery(userId: string): Promise<string> {
		if (!mongoose.Types.ObjectId.isValid(userId)) {
			return "Please <a href='FRONTEND_URL/login'>login</a> to check your orders.";
		}

		const orders = await Order.find({ userId }).sort({ createdAt: -1 }).exec();
		const pendingOrders = orders.filter(order => order.status === 'Pending');
		const pendingCount = pendingOrders.length;

		if (orders.length > 0) {
			const pendingOrderLink = `<a href='FRONTEND_URL/orders?status=Pending'>pending ${
				pendingCount > 1 ? 'orders' : 'order'
			}</a>`;

			const pendingOrdersMessage =
				pendingCount === 0 ? 'You have no pending orders.' : `You have ${pendingCount} ${pendingOrderLink}.`;

			const latestOrderStatus = orders[0].status.toLowerCase();
			const orderDetailsLink = `<a href='FRONTEND_URL/orders'>Click here</a> to see all your orders.`;

			return `${pendingOrdersMessage}<br />
              Your latest order is ${latestOrderStatus}.<br /><br />
              ${orderDetailsLink}`;
		} else {
			return "You have no orders. Would you like to browse <a href='FRONTEND_URL/books'>our catalog</a>?";
		}
	}

	private async checkBookAvailability(bookTitle: string): Promise<string> {
		try {
			const book = await Book.findOne({ title: new RegExp(bookTitle, 'i') });

			if (!book) {
				return `I'm sorry, but I couldn't find a book with the title "${bookTitle}" in our store. Would you like to search for a different book?`;
			}

			const bookTitleWithLink = `<a href='FRONTEND_URL/books/${book._id}'>${book.title}</a>`;

			if (book.stock > 0) {
				return `Good news! "${bookTitleWithLink}" by ${book.author} is available. We currently have ${
					book.stock
				} copies in stock. The price is $${book.price.toFixed(2)}.`;
			} else {
				return `I'm sorry, but "${bookTitleWithLink}" by ${book.author} is currently out of stock.`;
			}
		} catch (error) {
			console.error('Error checking book availability:', error);
			return "I'm having trouble checking the book's availability right now. Can I help you with something else?";
		}
	}
}
