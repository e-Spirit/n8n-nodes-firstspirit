import { NodeApiError, NodeOperationError } from 'n8n-workflow';
import { collectParams, placeholderNames } from '../nodes/FirstSpiritRestApi/parameters';
import { OperationRoute } from '../nodes/FirstSpiritRestApi/types';
import { FirstSpiritRestApi } from '../nodes/FirstSpiritRestApi/FirstSpiritRestApi.node';
import * as binaryMod from '../nodes/FirstSpiritRestApi/transport/binary';
import * as requestMod from '../nodes/FirstSpiritRestApi/transport/request';

// ── Module mocks (jest hoists these) ─────────────────────────────────────────

jest.mock('../nodes/FirstSpiritRestApi/transport/binary', () => ({
	downloadBinary: jest.fn(),
	buildUploadBody: jest.fn(),
	fileNameFromHeaders: jest.requireActual('../nodes/FirstSpiritRestApi/transport/binary')
		.fileNameFromHeaders,
}));

jest.mock('../nodes/FirstSpiritRestApi/transport/request', () => ({
	firstSpiritApiRequest: jest.fn(),
	contentTypeFor: jest.requireActual('../nodes/FirstSpiritRestApi/transport/request')
		.contentTypeFor,
	acceptFor: jest.requireActual('../nodes/FirstSpiritRestApi/transport/request').acceptFor,
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeMockContext(
	params: Record<string, unknown>,
	options: { items?: Array<{ json: Record<string, unknown> }>; continueOnFail?: boolean } = {},
) {
	const inputItems = options.items ?? [{ json: {} }];
	return {
		getInputData: jest.fn(() => inputItems),
		getNodeParameter: jest.fn((name: string, _i: number, fallback?: unknown) =>
			name in params ? params[name] : fallback,
		),
		getNode: jest.fn(() => ({ name: 'TestNode' })),
		continueOnFail: jest.fn(() => options.continueOnFail ?? false),
		helpers: {
			prepareBinaryData: jest.fn(async (buf: Buffer, name: string) => ({
				mimeType: 'application/octet-stream',
				data: buf.toString('base64'),
				fileName: name,
			})),
			assertBinaryData: jest.fn(),
			getBinaryDataBuffer: jest.fn(async () => Buffer.from('test')),
		},
	};
}

// ── Existing tests ────────────────────────────────────────────────────────────

const getFormEditor: OperationRoute = {
	resource: 'page',
	operation: 'getFormEditor',
	method: 'GET',
	path: '/v1/projects/{projectId}/pages/{pageUid}/form/{editorName}',
	languageSuffix: true,
	query: ['released'],
	specPaths: [
		'GET /v1/projects/{projectId}/pages/{pageUid}/form/{editorName}',
		'GET /v1/projects/{projectId}/pages/{pageUid}/form/{editorName}/{language}',
	],
};

describe('placeholderNames', () => {
	it('lists every placeholder of a path template', () => {
		expect(placeholderNames(getFormEditor.path)).toEqual(['projectId', 'pageUid', 'editorName']);
	});

	it('returns an empty list for a path without placeholders', () => {
		expect(placeholderNames('/v1/projects/')).toEqual([]);
	});

	it('recognises the folder wildcard', () => {
		expect(placeholderNames('/v1/projects/{projectId}/page-folders/{**}')).toEqual([
			'projectId',
			'**',
		]);
	});
});

describe('collectParams', () => {
	it('reads placeholders, the language and the declared query parameters', async () => {
		const values: Record<string, unknown> = {
			projectId: '42',
			pageUid: 'home',
			editorName: 'st_text',
			language: 'DE',
			released: true,
		};
		const context = {
			getNodeParameter: jest.fn((name: string, _i: number, fallback?: unknown) =>
				name in values ? values[name] : fallback,
			),
		};

		const params = await collectParams.call(context as never, getFormEditor, 0);

		expect(params).toEqual({
			projectId: '42',
			pageUid: 'home',
			editorName: 'st_text',
			language: 'DE',
			released: true,
		});
	});

	it('extracts the value of a resource locator parameter', async () => {
		const context = {
			getNodeParameter: jest.fn(
				(name: string, _i: number, fallback?: unknown, options?: unknown) => {
					if (name === 'projectId') {
						expect(options).toEqual({ extractValue: true });
						return '42';
					}
					return name === 'pageUid' ? 'home' : name === 'editorName' ? 'st_text' : fallback;
				},
			),
		};

		const params = await collectParams.call(context as never, getFormEditor, 0);

		expect(params.projectId).toBe('42');
	});

	it('leaves an unset optional parameter undefined', async () => {
		const context = {
			getNodeParameter: jest.fn(
				(name: string, _i: number, fallback?: unknown) =>
					(
						({ projectId: '42', pageUid: 'home', editorName: 'st_text' }) as Record<string, unknown>
					)[name] ?? fallback,
			),
		};

		const params = await collectParams.call(context as never, getFormEditor, 0);

		expect(params.language).toBeUndefined();
		expect(params.released).toBeUndefined();
	});
});

// ── Binary path tests ─────────────────────────────────────────────────────────

describe('FirstSpiritRestApi.execute — binary paths', () => {
	const downloadBinaryMock = binaryMod.downloadBinary as jest.Mock;
	const buildUploadBodyMock = binaryMod.buildUploadBody as jest.Mock;
	const firstSpiritApiRequestMock = requestMod.firstSpiritApiRequest as jest.Mock;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('media:getBinaryData emits an item with the binary property under the configured name', async () => {
		const fakeBinaryEntry = { mimeType: 'image/png', data: 'abc==', fileName: 'logo.png' };
		downloadBinaryMock.mockResolvedValue({ myProp: fakeBinaryEntry });

		const ctx = makeMockContext({
			resource: 'media',
			operation: 'getBinaryData',
			projectId: 'proj1',
			mediumUid: 'uid1',
			binaryPropertyName: 'myProp',
		});

		const node = new FirstSpiritRestApi();
		const result = await node.execute.call(ctx as never);

		expect(result[0]).toHaveLength(1);
		expect(result[0][0].binary).toEqual({ myProp: fakeBinaryEntry });
		expect(downloadBinaryMock).toHaveBeenCalledWith(
			expect.objectContaining({ resource: 'media', operation: 'getBinaryData' }),
			expect.objectContaining({ projectId: 'proj1', mediumUid: 'uid1' }),
			'myProp',
		);
	});

	it('media:uploadBinaryData sends the request with a multipart body', async () => {
		const fakeFormData = {
			buffer: Buffer.from('x'),
			contentType: 'multipart/form-data; boundary=b',
		};
		buildUploadBodyMock.mockResolvedValue(fakeFormData);
		firstSpiritApiRequestMock.mockResolvedValue({ result: 'ok' });

		const ctx = makeMockContext({
			resource: 'media',
			operation: 'uploadBinaryData',
			projectId: 'proj1',
			mediumUid: 'uid1',
			binaryPropertyName: 'data',
			splitItems: false,
		});

		const node = new FirstSpiritRestApi();
		const result = await node.execute.call(ctx as never);

		expect(buildUploadBodyMock).toHaveBeenCalledWith(0, 'data');
		expect(firstSpiritApiRequestMock).toHaveBeenCalledWith(
			expect.objectContaining({ body: fakeFormData }),
		);
		expect(result[0]).toHaveLength(1);
	});
});

// ── JSON, multi-item, pagination and failure handling ─────────────────────────

describe('FirstSpiritRestApi.execute — json path', () => {
	const firstSpiritApiRequestMock = requestMod.firstSpiritApiRequest as jest.Mock;
	const node = new FirstSpiritRestApi();

	beforeEach(() => {
		jest.clearAllMocks();
	});

	function pageGetContext(extra: Record<string, unknown> = {}, options = {}) {
		return makeMockContext(
			{
				resource: 'page',
				operation: 'get',
				projectId: 'proj1',
				pageUid: 'home',
				...extra,
			},
			options,
		);
	}

	it('emits a single item for an object response', async () => {
		firstSpiritApiRequestMock.mockResolvedValue({ uid: 'home', displayName: 'Home' });

		const result = await node.execute.call(pageGetContext() as never);

		expect(result[0]).toEqual([
			{ json: { uid: 'home', displayName: 'Home' }, pairedItem: { item: 0 } },
		]);
	});

	it('wraps a scalar response so the output is always an object', async () => {
		firstSpiritApiRequestMock.mockResolvedValue('plain text');

		const result = await node.execute.call(pageGetContext() as never);

		expect(result[0]).toEqual([{ json: { data: 'plain text' }, pairedItem: { item: 0 } }]);
	});

	it('splits an array response into one item per element when splitItems is on', async () => {
		firstSpiritApiRequestMock.mockResolvedValue([{ uid: 'a' }, { uid: 'b' }, { uid: 'c' }]);

		const result = await node.execute.call(pageGetContext({ splitItems: true }) as never);

		expect(result[0]).toHaveLength(3);
		expect(result[0].map((entry) => entry.json)).toEqual([
			{ uid: 'a' },
			{ uid: 'b' },
			{ uid: 'c' },
		]);
		expect(result[0].every((entry) => entry.pairedItem)).toBe(true);
	});

	it('keeps an array response as one item when splitItems is off', async () => {
		firstSpiritApiRequestMock.mockResolvedValue([{ uid: 'a' }, { uid: 'b' }]);

		const result = await node.execute.call(pageGetContext({ splitItems: false }) as never);

		expect(result[0]).toHaveLength(1);
	});

	it('pairs every output item with the input item it came from', async () => {
		firstSpiritApiRequestMock
			.mockResolvedValueOnce({ uid: 'first' })
			.mockResolvedValueOnce([{ uid: 'second-a' }, { uid: 'second-b' }])
			.mockResolvedValueOnce({ uid: 'third' });

		const context = pageGetContext(
			{ splitItems: true },
			{ items: [{ json: { n: 0 } }, { json: { n: 1 } }, { json: { n: 2 } }] },
		);
		const result = await node.execute.call(context as never);

		expect(firstSpiritApiRequestMock).toHaveBeenCalledTimes(3);
		expect(result[0].map((entry) => entry.pairedItem)).toEqual([
			{ item: 0 },
			{ item: 1 },
			{ item: 1 },
			{ item: 2 },
		]);
	});

	it('wraps a raw failure in a NodeOperationError that names the item', async () => {
		firstSpiritApiRequestMock
			.mockResolvedValueOnce({ uid: 'first' })
			.mockRejectedValueOnce(new Error('boom'));

		const context = pageGetContext({}, { items: [{ json: {} }, { json: {} }] });

		const error = await node.execute.call(context as never).catch((e: unknown) => e);
		expect(error).toBeInstanceOf(NodeOperationError);
		expect((error as NodeOperationError).message).toBe('boom');
		expect((error as NodeOperationError).context).toEqual(
			expect.objectContaining({ itemIndex: 1 }),
		);
	});

	it('lets an API error through unchanged', async () => {
		const apiError = new NodeApiError({ name: 'n' } as never, { message: 'nope' });
		firstSpiritApiRequestMock.mockRejectedValueOnce(apiError);

		const context = pageGetContext({}, { items: [{ json: {} }] });

		await expect(node.execute.call(context as never)).rejects.toBe(apiError);
	});

	it('aborts the whole run on a failure when continueOnFail is off', async () => {
		firstSpiritApiRequestMock
			.mockResolvedValueOnce({ uid: 'first' })
			.mockRejectedValueOnce(new Error('boom'));

		const context = pageGetContext({}, { items: [{ json: {} }, { json: {} }, { json: {} }] });

		await expect(node.execute.call(context as never)).rejects.toThrow('boom');
		expect(firstSpiritApiRequestMock).toHaveBeenCalledTimes(2);
	});

	it('continues past a failing item and reports the error on that item', async () => {
		firstSpiritApiRequestMock
			.mockResolvedValueOnce({ uid: 'first' })
			.mockRejectedValueOnce(new Error('item two exploded'))
			.mockResolvedValueOnce({ uid: 'third' });

		const context = pageGetContext(
			{},
			{ items: [{ json: {} }, { json: {} }, { json: {} }], continueOnFail: true },
		);
		const result = await node.execute.call(context as never);

		expect(firstSpiritApiRequestMock).toHaveBeenCalledTimes(3);
		expect(result[0]).toHaveLength(3);
		expect(result[0][1].json).toEqual({ error: 'item two exploded' });
		expect(result[0].map((entry) => entry.pairedItem)).toEqual([
			{ item: 0 },
			{ item: 1 },
			{ item: 2 },
		]);
		expect(result[0][2].json).toEqual({ uid: 'third' });
	});

	it('raises a NodeOperationError for an unknown resource and operation pair', async () => {
		const context = makeMockContext({ resource: 'page', operation: 'noSuchOperation' });

		await expect(node.execute.call(context as never)).rejects.toThrow(/Unsupported operation/);
	});
});

describe('FirstSpiritRestApi.execute — paginated path', () => {
	const firstSpiritApiRequestMock = requestMod.firstSpiritApiRequest as jest.Mock;
	const node = new FirstSpiritRestApi();

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('stops requesting pages once the limit is covered', async () => {
		// A server with far more hits than the limit: every page comes back full.
		firstSpiritApiRequestMock.mockResolvedValue({
			totalElements: 5000,
			elements: Array.from({ length: 5 }, (_, n) => ({ uid: `hit${n}` })),
		});

		const context = makeMockContext({
			resource: 'search',
			operation: 'search',
			projectId: 'proj1',
			q: 'news',
			returnAll: false,
			limit: 5,
		});
		const result = await node.execute.call(context as never);

		expect(result[0]).toHaveLength(5);
		// The limit is covered by the first page, so no further page is requested.
		expect(firstSpiritApiRequestMock).toHaveBeenCalledTimes(1);
		expect(result[0].every((entry) => entry.pairedItem)).toBe(true);
	});

	it('does not exceed the limit when a page overshoots it', async () => {
		firstSpiritApiRequestMock.mockResolvedValue({
			elements: Array.from({ length: 4 }, (_, n) => ({ uid: `hit${n}` })),
		});

		const context = makeMockContext({
			resource: 'search',
			operation: 'search',
			projectId: 'proj1',
			q: 'news',
			returnAll: false,
			limit: 3,
		});
		const result = await node.execute.call(context as never);

		expect(result[0]).toHaveLength(3);
		expect(firstSpiritApiRequestMock).toHaveBeenCalledTimes(1);
	});

	it('returns everything when Return All is on', async () => {
		firstSpiritApiRequestMock.mockResolvedValue({ elements: [{ uid: 'only' }] });

		const context = makeMockContext({
			resource: 'search',
			operation: 'search',
			projectId: 'proj1',
			q: 'news',
			returnAll: true,
		});
		const result = await node.execute.call(context as never);

		expect(result[0]).toHaveLength(1);
		expect(firstSpiritApiRequestMock).toHaveBeenCalledTimes(1);
	});
});

// ── Number casts in the request body ─────────────────────────────────────────

describe('FirstSpiritRestApi.execute — numeric body fields', () => {
	const firstSpiritApiRequestMock = requestMod.firstSpiritApiRequest as jest.Mock;
	const node = new FirstSpiritRestApi();
	const sectionAdd = {
		resource: 'section',
		operation: 'add',
		projectId: 'proj1',
		pageUid: 'home',
		bodyName: 'content',
		sectionName: 'intro',
		templateUid: 'text',
	};

	beforeEach(() => {
		jest.clearAllMocks();
		firstSpiritRestApiMockReset();
	});

	function firstSpiritRestApiMockReset() {
		firstSpiritApiRequestMock.mockResolvedValue({ ok: true });
	}

	it('sends a numeric string as a number', async () => {
		await node.execute.call(makeMockContext({ ...sectionAdd, index: '2' }) as never);

		expect(firstSpiritApiRequestMock).toHaveBeenCalledWith(
			expect.objectContaining({ body: expect.objectContaining({ index: 2 }) }),
		);
	});

	it('rejects a value that is not a number instead of dropping it', async () => {
		const run = node.execute.call(makeMockContext({ ...sectionAdd, index: 'abc' }) as never);

		await expect(run).rejects.toBeInstanceOf(NodeOperationError);
		await expect(run).rejects.toThrow(/"index".*number.*"abc"/);
		expect(firstSpiritApiRequestMock).not.toHaveBeenCalled();
	});

	it('still leaves an empty optional number out of the body', async () => {
		await node.execute.call(makeMockContext({ ...sectionAdd, index: '' }) as never);

		const sent = firstSpiritApiRequestMock.mock.calls[0][0].body;
		expect(sent).not.toHaveProperty('index');
	});

	it('reports the error per item when Continue On Fail is on', async () => {
		const result = await node.execute.call(
			makeMockContext({ ...sectionAdd, index: 'abc' }, { continueOnFail: true }) as never,
		);

		expect(result[0][0].json.error).toMatch(/"index".*number/);
	});
});
