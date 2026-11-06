import { NodeOperationError } from 'n8n-workflow';
import {
	extractItems,
	fetchAllPages,
	MAX_PAGES,
} from '../nodes/FirstSpiritRestApi/transport/pagination';
import { OperationRoute } from '../nodes/FirstSpiritRestApi/types';

const search: OperationRoute = {
	resource: 'search',
	operation: 'search',
	method: 'GET',
	path: '/v1/projects/{projectId}/search',
	query: ['q', 'page', 'size'],
	paginated: true,
	specPaths: ['GET /v1/projects/{projectId}/search'],
};

function contextReturning(pages: unknown[]) {
	const httpRequest = jest.fn();
	for (const page of pages) httpRequest.mockResolvedValueOnce(page);
	httpRequest.mockResolvedValue([]);
	return {
		httpRequest,
		context: {
			getCredentials: jest.fn().mockResolvedValue({
				username: 'u',
				password: 'p',
				baseUrl: 'https://host/rest',
			}),
			getNode: jest.fn().mockReturnValue({ name: 'FirstSpirit REST API' }),
			helpers: {
				httpRequestWithAuthentication: (_credential: string, options: unknown) =>
					httpRequest(options),
			},
		},
	};
}

function endlessContext(httpRequest: jest.Mock) {
	return {
		getCredentials: jest.fn().mockResolvedValue({
			username: 'u',
			password: 'p',
			baseUrl: 'https://host/rest',
		}),
		getNode: jest.fn().mockReturnValue({ name: 'FirstSpirit REST API' }),
		helpers: {
			httpRequestWithAuthentication: (_credential: string, options: unknown) =>
				httpRequest(options),
		},
	};
}

describe('extractItems', () => {
	it('returns an array response as is', () => {
		expect(extractItems([{ a: 1 }, { a: 2 }])).toEqual([{ a: 1 }, { a: 2 }]);
	});

	it('finds the first array property of an object response', () => {
		expect(extractItems({ totalElements: 2, elements: [{ a: 1 }] })).toEqual([{ a: 1 }]);
	});

	it('wraps an object without any array property', () => {
		expect(extractItems({ a: 1 })).toEqual([{ a: 1 }]);
	});

	it('returns an empty array for null', () => {
		expect(extractItems(null)).toEqual([]);
	});
});

describe('fetchAllPages', () => {
	it('stops on the first short page', async () => {
		const { context, httpRequest } = contextReturning([[1, 2], [3]]);

		const result = await fetchAllPages.call(
			context as never,
			search,
			{ projectId: '1', q: 'x' },
			2,
		);

		expect(result).toEqual([1, 2, 3]);
		expect(httpRequest).toHaveBeenCalledTimes(2);
	});

	it('stops on an empty page', async () => {
		const { context, httpRequest } = contextReturning([[1, 2], []]);

		const result = await fetchAllPages.call(
			context as never,
			search,
			{ projectId: '1', q: 'x' },
			2,
		);

		expect(result).toEqual([1, 2]);
		expect(httpRequest).toHaveBeenCalledTimes(2);
	});

	it('increments the page parameter on each request', async () => {
		const { context, httpRequest } = contextReturning([[1, 2], [3, 4], [5]]);

		await fetchAllPages.call(context as never, search, { projectId: '1', q: 'x' }, 2);

		expect(httpRequest.mock.calls[0][0].url).toContain('page=0&size=2');
		expect(httpRequest.mock.calls[1][0].url).toContain('page=1&size=2');
		expect(httpRequest.mock.calls[2][0].url).toContain('page=2&size=2');
	});

	it('stops as soon as maxItems have been collected', async () => {
		const httpRequest = jest.fn().mockResolvedValue([1, 2, 3, 4, 5]);
		const context = endlessContext(httpRequest);

		const result = await fetchAllPages.call(
			context as never,
			search,
			{ projectId: '1', q: 'x' },
			5,
			8,
		);

		expect(result).toHaveLength(8);
		expect(httpRequest).toHaveBeenCalledTimes(2);
	});

	it('issues a single request when maxItems fits into one page', async () => {
		const httpRequest = jest.fn().mockResolvedValue([1, 2]);
		const context = endlessContext(httpRequest);

		const result = await fetchAllPages.call(
			context as never,
			search,
			{ projectId: '1', q: 'x' },
			2,
			2,
		);

		expect(result).toEqual([1, 2]);
		expect(httpRequest).toHaveBeenCalledTimes(1);
	});

	it('does not loop when an object response is repeated and maxItems is 1', async () => {
		const httpRequest = jest.fn().mockResolvedValue({ uid: 'only' });
		const context = endlessContext(httpRequest);

		const result = await fetchAllPages.call(
			context as never,
			search,
			{ projectId: '1', q: 'x' },
			1,
			1,
		);

		expect(result).toEqual([{ uid: 'only' }]);
		expect(httpRequest).toHaveBeenCalledTimes(1);
	});

	it('raises an error rather than truncating silently after MAX_PAGES', async () => {
		const httpRequest = jest.fn().mockResolvedValue([1, 2]);
		const context = endlessContext(httpRequest);

		await expect(
			fetchAllPages.call(context as never, search, { projectId: '1', q: 'x' }, 2),
		).rejects.toBeInstanceOf(NodeOperationError);

		expect(httpRequest).toHaveBeenCalledTimes(MAX_PAGES);
	});
});
