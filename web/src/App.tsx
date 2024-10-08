import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SnackbarProvider } from 'notistack';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, CartProvider } from './contexts';
import Routes from './routes';

function App() {
	const queryClient = new QueryClient();

	return (
		<BrowserRouter>
			<QueryClientProvider client={queryClient}>
				<SnackbarProvider
					autoHideDuration={1500}
					anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
					disableWindowBlurListener>
					<AuthProvider>
						<CartProvider>
							<Routes />
							{/* <ReactQueryDevtools initialIsOpen={false} /> */}
						</CartProvider>
					</AuthProvider>
				</SnackbarProvider>
			</QueryClientProvider>
		</BrowserRouter>
	);
}

export default App;
