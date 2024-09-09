import { Chat as ChatIcon, Refresh as RefreshIcon, Send as SendIcon } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import {
	Box,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	Fab,
	IconButton,
	List,
	ListItem,
	ListItemText,
	Paper,
	TextField,
	Tooltip,
} from '@mui/material';
import { blue, grey } from '@mui/material/colors';
import axios from 'axios';
import DOMPurify from 'dompurify';
import React, { useEffect, useRef, useState } from 'react';
import { BACKEND_URL } from '../../../consts';
import { getHeaders } from '../../../utils';

export function Chatbot() {
	const token = localStorage.getItem('token') || '';
	const [message, setMessage] = useState('');
	const [chatHistory, setChatHistory] = useState<any>([]);
	const [isOpen, setIsOpen] = useState(false);
	const messagesEndRef = useRef<null | HTMLDivElement>(null);

	const getBaseUrl = () => {
		return `${window.location.protocol}//${window.location.host}`;
	};

	const replacePlaceholders = (message: string, url: string) => {
		return message.replace(/FRONTEND_URL/g, url);
	};

	const baseUrl = getBaseUrl();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!message.trim()) return;

		await sendMessage(message);
	};

	const sendMessage = async (userMessage: string) => {
		setMessage('');
		setChatHistory((prev: any) => [...prev, { type: 'user', content: userMessage }]);

		try {
			const response = await axios.post(
				`${BACKEND_URL}/chat`,
				{
					message: userMessage,
					history: chatHistory.map((msg: { type: string; content: any }) => `${msg.type}: ${msg.content}`),
				},
				token ? getHeaders(token) : undefined
			);

			setChatHistory((prev: any) => [...prev, { type: 'bot', content: response.data.botMessage }]);
		} catch (error) {
			console.error('Error:', error);
			setChatHistory((prev: any) => [
				...prev,
				{ type: 'bot', content: 'Sorry, I encountered an error. Please try again.' },
			]);
		}
	};

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	useEffect(scrollToBottom, [chatHistory]);

	const startNewConversation = () => {
		setChatHistory([
			{
				type: 'bot',
				content: 'Hello! Welcome to our bookstore chat. How can I assist you today?',
			},
		]);
	};

	useEffect(() => {
		if (isOpen && chatHistory.length === 0) {
			startNewConversation();
		}
	}, [isOpen]);

	const handleClose = () => setIsOpen(false);

	return (
		<>
			<Fab
				color='primary'
				aria-label='chat'
				style={{ position: 'fixed', bottom: 16, right: 16 }}
				onClick={() => setIsOpen(true)}>
				<ChatIcon />
			</Fab>

			<Dialog open={isOpen} onClose={handleClose} fullWidth maxWidth='sm'>
				<DialogTitle sx={{ m: 0, p: 2 }}>Virtual Assistant</DialogTitle>

				{chatHistory.length > 2 && (
					<Tooltip title='Start a new conversation'>
						<IconButton
							onClick={startNewConversation}
							sx={{
								position: 'absolute',
								right: 48,
								top: 8,
								color: blue[300],
							}}>
							<RefreshIcon />
						</IconButton>
					</Tooltip>
				)}

				<IconButton
					onClick={handleClose}
					sx={theme => ({
						position: 'absolute',
						right: 8,
						top: 8,
						color: theme.palette.grey[500],
					})}>
					<CloseIcon />
				</IconButton>

				<Divider />

				<DialogContent style={{ height: '50vh', overflowY: 'auto', padding: '16px' }}>
					<List>
						{chatHistory.map(
							(msg: { type: string; content: string }, index: React.Key | null | undefined) => (
								<ListItem
									key={index}
									alignItems='flex-start'
									style={{ flexDirection: msg.type === 'user' ? 'row-reverse' : 'row' }}>
									<Paper
										style={{
											padding: '8px 16px',
											backgroundColor: msg.type === 'user' ? blue[50] : grey[100],
											maxWidth: '70%',
										}}>
										<ListItemText
											sx={{ color: grey[700] }}
											primary={
												<span
													dangerouslySetInnerHTML={{
														__html: DOMPurify.sanitize(
															replacePlaceholders(msg.content, baseUrl)
														),
													}}
												/>
											}
										/>
									</Paper>
								</ListItem>
							)
						)}
					</List>
					<div ref={messagesEndRef} />
				</DialogContent>

				<Divider />

				<DialogActions>
					<Box
						component='form'
						onSubmit={handleSubmit}
						sx={{ width: '100%', display: 'flex', alignItems: 'center', m: 1, mr: 0 }}>
						<TextField
							fullWidth
							value={message}
							onChange={e => setMessage(e.target.value)}
							placeholder='Type your message...'
							size='small'
						/>
						<IconButton color='primary' type='submit' sx={{ ml: 1 }} disabled={!message.length}>
							<SendIcon />
						</IconButton>
					</Box>
				</DialogActions>
			</Dialog>
		</>
	);
}
