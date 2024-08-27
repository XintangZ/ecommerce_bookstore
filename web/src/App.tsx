import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts';
import Routes from './routes';

function App() {
	const queryClient = new QueryClient();

	return (
		<BrowserRouter>
			<AuthProvider>
				<QueryClientProvider client={queryClient}>
					<Routes />
					<ReactQueryDevtools initialIsOpen={false} />
				</QueryClientProvider>
			</AuthProvider>
		</BrowserRouter>
	);
}

export default App;
