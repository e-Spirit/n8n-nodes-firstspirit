import { buildUrl, normalizeBaseUrl, resolvePath } from '../nodes/FirstSpiritRestApi/transport/url';
import { OperationRoute } from '../nodes/FirstSpiritRestApi/types';

const getPage: OperationRoute = {
	resource: 'page',
	operation: 'get',
	method: 'GET',
	path: '/v1/projects/{projectId}/pages/{pageUid}',
	specPaths: ['GET /v1/projects/{projectId}/pages/{pageUid}'],
};

const getFormEditor: OperationRoute = {
	resource: 'page',
	operation: 'getFormEditor',
	method: 'GET',
	path: '/v1/projects/{projectId}/pages/{pageUid}/form/{editorName}',
	languageSuffix: true,
	specPaths: [
		'GET /v1/projects/{projectId}/pages/{pageUid}/form/{editorName}',
		'GET /v1/projects/{projectId}/pages/{pageUid}/form/{editorName}/{language}',
	],
};

const getPageFolder: OperationRoute = {
	resource: 'folder',
	operation: 'getPageFolder',
	method: 'GET',
	path: '/v1/projects/{projectId}/page-folders/{**}',
	specPaths: ['GET /v1/projects/{projectId}/page-folders/**'],
};

const search: OperationRoute = {
	resource: 'search',
	operation: 'search',
	method: 'GET',
	path: '/v1/projects/{projectId}/search',
	query: ['q', 'page', 'size'],
	paginated: true,
	specPaths: ['GET /v1/projects/{projectId}/search'],
};

describe('normalizeBaseUrl', () => {
	it('strips a single trailing slash', () => {
		expect(normalizeBaseUrl('https://host/rest/')).toBe('https://host/rest');
	});

	it('leaves a url without trailing slash untouched', () => {
		expect(normalizeBaseUrl('https://host/rest')).toBe('https://host/rest');
	});

	it('produces the same url for both spellings', () => {
		expect(buildUrl('https://host/rest/', getPage, { projectId: '1', pageUid: 'home' })).toBe(
			buildUrl('https://host/rest', getPage, { projectId: '1', pageUid: 'home' }),
		);
	});
});

describe('resolvePath', () => {
	it('substitutes placeholders', () => {
		expect(resolvePath(getPage, { projectId: '1', pageUid: 'home' })).toBe(
			'/v1/projects/1/pages/home',
		);
	});

	it('encodes special characters in a segment', () => {
		expect(resolvePath(getPage, { projectId: '1', pageUid: 'my page/2024' })).toBe(
			'/v1/projects/1/pages/my%20page%2F2024',
		);
	});

	it('encodes umlauts in a segment', () => {
		expect(resolvePath(getPage, { projectId: '1', pageUid: 'grüße' })).toBe(
			'/v1/projects/1/pages/gr%C3%BC%C3%9Fe',
		);
	});

	it('omits the language segment when the language is empty', () => {
		expect(
			resolvePath(getFormEditor, { projectId: '1', pageUid: 'home', editorName: 'st_text' }),
		).toBe('/v1/projects/1/pages/home/form/st_text');
	});

	it('omits the language segment when the language is an empty string', () => {
		expect(
			resolvePath(getFormEditor, {
				projectId: '1',
				pageUid: 'home',
				editorName: 'st_text',
				language: '',
			}),
		).toBe('/v1/projects/1/pages/home/form/st_text');
	});

	it('appends the language segment when a language is given', () => {
		expect(
			resolvePath(getFormEditor, {
				projectId: '1',
				pageUid: 'home',
				editorName: 'st_text',
				language: 'DE',
			}),
		).toBe('/v1/projects/1/pages/home/form/st_text/DE');
	});

	it('keeps slashes in a folder wildcard but encodes each segment', () => {
		expect(resolvePath(getPageFolder, { projectId: '1', '**': 'products/new items' })).toBe(
			'/v1/projects/1/page-folders/products/new%20items',
		);
	});

	it('tolerates a folder wildcard with leading and trailing slashes', () => {
		expect(resolvePath(getPageFolder, { projectId: '1', '**': '/products/' })).toBe(
			'/v1/projects/1/page-folders/products',
		);
	});

	it('throws when a required placeholder is missing', () => {
		expect(() => resolvePath(getPage, { projectId: '1' })).toThrow(/pageUid/);
	});
});

describe('buildUrl', () => {
	it('appends declared query parameters that are set', () => {
		expect(
			buildUrl('https://host/rest', search, { projectId: '1', q: 'news', page: 0, size: 20 }),
		).toBe('https://host/rest/v1/projects/1/search?q=news&page=0&size=20');
	});

	it('skips query parameters that are undefined or empty', () => {
		expect(
			buildUrl('https://host/rest', search, {
				projectId: '1',
				q: 'news',
				page: undefined,
				size: '',
			}),
		).toBe('https://host/rest/v1/projects/1/search?q=news');
	});

	it('keeps a boolean false query parameter', () => {
		const route: OperationRoute = { ...search, query: ['released'] };
		expect(buildUrl('https://host/rest', route, { projectId: '1', released: false })).toBe(
			'https://host/rest/v1/projects/1/search?released=false',
		);
	});

	it('encodes query values', () => {
		expect(buildUrl('https://host/rest', search, { projectId: '1', q: 'a&b c' })).toBe(
			'https://host/rest/v1/projects/1/search?q=a%26b+c',
		);
	});
});
