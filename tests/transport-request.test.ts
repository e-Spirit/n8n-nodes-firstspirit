import { NodeApiError } from 'n8n-workflow';
import {
	acceptFor,
	contentTypeFor,
	firstSpiritApiRequest,
} from '../nodes/FirstSpiritRestApi/transport/request';
import { OperationRoute } from '../nodes/FirstSpiritRestApi/types';
import { operationRoutes } from '../nodes/FirstSpiritRestApi/operations';

const getPage: OperationRoute = {
	resource: 'page',
	operation: 'get',
	method: 'GET',
	path: '/v1/projects/{projectId}/pages/{pageUid}',
	specPaths: ['GET /v1/projects/{projectId}/pages/{pageUid}'],
};

const executeScript: OperationRoute = {
	resource: 'script',
	operation: 'execute',
	method: 'POST',
	path: '/v1/projects/{projectId}/scripts/{scriptName}/execute',
	body: 'json',
	accept: 'text',
	specPaths: ['POST /v1/projects/{projectId}/scripts/{scriptName}/execute'],
};

const multipart = {
	buffer: Buffer.from('--b\r\n--b--\r\n'),
	contentType: 'multipart/form-data; boundary=b',
};

function route(resource: string, operation: string): OperationRoute {
	const found = operationRoutes.find((r) => r.resource === resource && r.operation === operation);
	if (found === undefined) throw new Error(`no route for ${resource}:${operation}`);
	return found;
}

const setGom = route('pageTemplate', 'setGom');

function contextWith(httpRequest: jest.Mock) {
	return {
		getCredentials: jest.fn().mockResolvedValue({
			username: 'user',
			password: 'secret',
			baseUrl: 'https://host/rest',
		}),
		getNode: jest.fn().mockReturnValue({ name: 'FirstSpirit REST API' }),
		helpers: {
			httpRequestWithAuthentication: jest.fn((_credential: string, options: unknown) =>
				httpRequest(options),
			),
		},
	};
}

describe('contentTypeFor', () => {
	it('maps the body kinds to their default content types', () => {
		expect(contentTypeFor({ body: 'json' })).toBe('application/json');
		expect(contentTypeFor({ body: 'text' })).toBe('text/plain');
		expect(contentTypeFor({ body: 'xml' })).toBe('text/xml');
		expect(contentTypeFor({ body: 'none' })).toBeUndefined();
		expect(contentTypeFor({})).toBeUndefined();
	});

	it('lets a route override the default', () => {
		expect(contentTypeFor({ body: 'xml', contentType: 'application/xml' })).toBe('application/xml');
	});
});

describe('acceptFor', () => {
	it('maps the accept kinds to their default header values', () => {
		expect(acceptFor({ accept: 'json' })).toBe('application/json');
		expect(acceptFor({ accept: 'text' })).toBe('text/plain');
		expect(acceptFor({ accept: 'xml' })).toBe('application/xml');
		expect(acceptFor({ accept: 'binary' })).toBe('*/*');
		expect(acceptFor({})).toBe('application/json');
	});

	it('lets a route override the default', () => {
		expect(acceptFor({ accept: 'xml', acceptType: 'text/xml' })).toBe('text/xml');
	});
});

describe('route media types match the OpenAPI spec', () => {
	const templateFamilies = ['pageTemplate', 'sectionTemplate', 'linkTemplate'];

	it.each(templateFamilies)('%s gom and rules use application/xml', (resource) => {
		for (const operation of ['setGom', 'setRules']) {
			expect(contentTypeFor(route(resource, operation))).toBe('application/xml');
		}
		for (const operation of ['getGom', 'getRules']) {
			expect(acceptFor(route(resource, operation))).toBe('application/xml');
		}
	});

	it('script gom uses text/xml for both directions', () => {
		expect(acceptFor(route('script', 'getGom'))).toBe('text/xml');
		expect(contentTypeFor(route('script', 'setGom'))).toBe('text/xml');
		expect(acceptFor(route('script', 'setGom'))).toBe('text/xml');
	});
});

describe('firstSpiritApiRequest', () => {
	it('sends the built url and lets n8n apply the credential', async () => {
		const httpRequest = jest.fn().mockResolvedValue({ uid: 'home' });
		const context = contextWith(httpRequest);

		await firstSpiritApiRequest.call(context as never, {
			route: getPage,
			params: { projectId: '1', pageUid: 'home' },
		});

		expect(httpRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'GET',
				url: 'https://host/rest/v1/projects/1/pages/home',
				headers: expect.objectContaining({
					Accept: 'application/json',
				}),
				json: true,
			}),
		);
		expect(httpRequest.mock.calls[0][0].headers).not.toHaveProperty('Authorization');
		expect(context.helpers.httpRequestWithAuthentication).toHaveBeenCalledWith(
			'firstSpiritApi',
			expect.anything(),
		);
	});

	it('does not parse a text response as json', async () => {
		const httpRequest = jest.fn().mockResolvedValue('script output, not json');
		const context = contextWith(httpRequest);

		const result = await firstSpiritApiRequest.call(context as never, {
			route: executeScript,
			params: { projectId: '1', scriptName: 'cleanup' },
			body: { parameters: {} },
		});

		expect(httpRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				json: false,
				headers: expect.objectContaining({ Accept: 'text/plain' }),
			}),
		);
		expect(result).toBe('script output, not json');
	});

	it('sends an xml body as a raw string with an xml content type', async () => {
		const httpRequest = jest.fn().mockResolvedValue({});
		const context = contextWith(httpRequest);

		await firstSpiritApiRequest.call(context as never, {
			route: setGom,
			params: { projectId: '1', pageTemplateUid: 'standard' },
			body: '<CMS_MODULE/>',
		});

		expect(httpRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				body: '<CMS_MODULE/>',
				headers: expect.objectContaining({ 'Content-Type': 'application/xml' }),
			}),
		);
	});

	it('sends no body and no content type for a bodyless route', async () => {
		const httpRequest = jest.fn().mockResolvedValue({});
		const context = contextWith(httpRequest);

		await firstSpiritApiRequest.call(context as never, {
			route: getPage,
			params: { projectId: '1', pageUid: 'home' },
		});

		const sent = httpRequest.mock.calls[0][0];
		expect(sent.body).toBeUndefined();
		expect(sent.headers['Content-Type']).toBeUndefined();
	});

	it('wraps an http error in a NodeApiError', async () => {
		// The axios shape that this.helpers.httpRequest actually rejects with.
		const httpRequest = jest.fn().mockRejectedValue({
			isAxiosError: true,
			message: 'Request failed with status code 404',
			response: { status: 404, data: { message: 'Page not found', uid: 'home' } },
		});
		const context = contextWith(httpRequest);

		await expect(
			firstSpiritApiRequest.call(context as never, {
				route: getPage,
				params: { projectId: '1', pageUid: 'home' },
			}),
		).rejects.toBeInstanceOf(NodeApiError);
	});

	it('surfaces the api message when n8n has already wrapped the error in a NodeApiError', async () => {
		// httpRequestWithAuthentication wraps the axios error itself, and NodeApiError returns an
		// already wrapped error unchanged, so the server text must be read from the wrapped error.
		const axiosError = Object.assign(new Error('Request failed with status code 404'), {
			isAxiosError: true,
			response: {
				status: 404,
				data: { status: 404, error: "Project broker for project with id '1' not found!" },
			},
		});
		Object.defineProperty(axiosError.constructor, 'name', { value: 'AxiosError' });
		const wrapped = new NodeApiError({ name: 'FirstSpirit REST API' } as never, axiosError as never);
		const context = contextWith(jest.fn().mockRejectedValue(wrapped));

		const rejection = firstSpiritApiRequest.call(context as never, {
			route: getPage,
			params: { projectId: '1', pageUid: 'home' },
		});

		await expect(rejection).rejects.toThrow(/Project broker for project with id '1' not found!/);
		await expect(rejection).rejects.toMatchObject({
			description: 'GET https://host/rest/v1/projects/1/pages/home',
		});
	});

	it('surfaces the api message from the axios response data', async () => {
		const httpRequest = jest.fn().mockRejectedValue({
			isAxiosError: true,
			message: 'Request failed with status code 404',
			response: { status: 404, data: { message: 'Page not found' } },
		});
		const context = contextWith(httpRequest);

		await expect(
			firstSpiritApiRequest.call(context as never, {
				route: getPage,
				params: { projectId: '1', pageUid: 'home' },
			}),
		).rejects.toThrow(/Page not found/);
	});

	it('surfaces a plain string error body', async () => {
		const httpRequest = jest.fn().mockRejectedValue({
			isAxiosError: true,
			message: 'Request failed with status code 500',
			response: { status: 500, data: 'Internal server error in the script engine' },
		});
		const context = contextWith(httpRequest);

		await expect(
			firstSpiritApiRequest.call(context as never, {
				route: getPage,
				params: { projectId: '1', pageUid: 'home' },
			}),
		).rejects.toThrow(/script engine/);
	});

	it("leaves n8n's own status headline in place when the api says nothing", async () => {
		const httpRequest = jest.fn().mockRejectedValue({
			isAxiosError: true,
			message: 'Request failed with status code 401',
			response: { status: 401, data: '' },
		});
		const context = contextWith(httpRequest);

		await expect(
			firstSpiritApiRequest.call(context as never, {
				route: getPage,
				params: { projectId: '1', pageUid: 'home' },
			}),
		).rejects.toThrow(/Authorization failed/);
	});

	it('asks for a text response on text and xml routes', async () => {
		const httpRequest = jest.fn().mockResolvedValue('42');
		const context = contextWith(httpRequest);

		await firstSpiritApiRequest.call(context as never, {
			route: executeScript,
			params: { projectId: '1', scriptName: 'cleanup' },
			body: {},
		});

		expect(httpRequest.mock.calls[0][0].encoding).toBe('text');
	});

	it('parses the json response of a multipart upload', async () => {
		const httpRequest = jest.fn().mockResolvedValue('{"uid":"logo","fileName":"logo.png"}');
		const context = contextWith(httpRequest);

		const result = await firstSpiritApiRequest.call(context as never, {
			route: route('media', 'uploadBinaryData'),
			params: { projectId: '1', mediumUid: 'logo' },
			body: multipart,
		});

		expect(result).toEqual({ uid: 'logo', fileName: 'logo.png' });
	});

	it('sends a multipart body as a buffer with its own content type', async () => {
		const httpRequest = jest.fn().mockResolvedValue('{}');
		const context = contextWith(httpRequest);

		await firstSpiritApiRequest.call(context as never, {
			route: route('media', 'uploadBinaryData'),
			params: { projectId: '1', mediumUid: 'logo' },
			body: multipart,
		});

		const sent = httpRequest.mock.calls[0][0];
		expect(sent.body).toBe(multipart.buffer);
		expect(sent.headers['Content-Type']).toBe('multipart/form-data; boundary=b');
		expect(sent.json).toBe(false);
	});

	it('keeps a non-json multipart response as it is', async () => {
		const httpRequest = jest.fn().mockResolvedValue('uploaded');
		const context = contextWith(httpRequest);

		const result = await firstSpiritApiRequest.call(context as never, {
			route: route('media', 'uploadBinaryData'),
			params: { projectId: '1', mediumUid: 'logo' },
			body: multipart,
		});

		expect(result).toBe('uploaded');
	});

	it('overrides win over computed values — json:false overrides the computed json:true', async () => {
		const httpRequest = jest.fn().mockResolvedValue(new ArrayBuffer(0));
		const context = contextWith(httpRequest);

		await firstSpiritApiRequest.call(context as never, {
			route: getPage, // computed json would be true
			params: { projectId: '1', pageUid: 'home' },
			overrides: { json: false, encoding: 'arraybuffer', returnFullResponse: true },
		});

		const sent = httpRequest.mock.calls[0][0];
		expect(sent.json).toBe(false);
		expect(sent.encoding).toBe('arraybuffer');
		expect(sent.returnFullResponse).toBe(true);
		// a key not in overrides still keeps its computed value
		expect(sent.method).toBe('GET');
	});
});
