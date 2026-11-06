import { OperationRoute } from '../types';

export function normalizeBaseUrl(baseUrl: string): string {
	return baseUrl.replace(/\/+$/, '');
}

function encodeWildcard(value: string): string {
	return value
		.split('/')
		.filter((segment) => segment.length > 0)
		.map(encodeURIComponent)
		.join('/');
}

export function resolvePath(route: OperationRoute, params: Record<string, unknown>): string {
	let path = route.path.replace(/\{([^}]+)\}/g, (_match, name: string) => {
		const value = params[name];
		if (value === undefined || value === null || value === '') {
			throw new Error(`Missing value for path parameter "${name}"`);
		}
		return name === '**' ? encodeWildcard(String(value)) : encodeURIComponent(String(value));
	});

	if (route.languageSuffix) {
		const language = params.language;
		if (language !== undefined && language !== null && language !== '') {
			path += `/${encodeURIComponent(String(language))}`;
		}
	}

	return path;
}

export function buildQuery(route: OperationRoute, params: Record<string, unknown>): string {
	if (!route.query?.length) return '';
	const search = new URLSearchParams();
	for (const name of route.query) {
		const value = params[name];
		if (value === undefined || value === null || value === '') continue;
		search.append(name, String(value));
	}
	const query = search.toString();
	return query ? `?${query}` : '';
}

export function buildUrl(
	baseUrl: string,
	route: OperationRoute,
	params: Record<string, unknown>,
): string {
	return `${normalizeBaseUrl(baseUrl)}${resolvePath(route, params)}${buildQuery(route, params)}`;
}
