import Link, { LinkProps } from '@mui/material/Link';
import { Link as RouterLink } from 'react-router-dom';

interface PropsI extends LinkProps {
	to: string;
	replace?: boolean;
}

export function LinkRouter(props: PropsI) {
	return <Link {...props} component={RouterLink as any} />;
}
