import {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	JsonObject,
	NodeApiError,
} from 'n8n-workflow';
import { AcceptKind, BodyKind, MultipartBody, OperationRoute } from '../types';
import { buildUrl } from './url';

export interface FirstSpiritCredentials {
	username: string;
	password: string;
	baseUrl: string;
}

export interface RequestOptions {
	route: OperationRoute;
	params: Record<string, unknown>;
	/** Already-parsed body. Objects for 'json', strings for 'text' and 'xml', a MultipartBody for 'multipart'. */
	body?: unknown;
	/** Overrides derived from the route, used by the binary and pagination helpers. */
	overrides?: Partial<IHttpRequestOptions>;
}

/** Defaults per body kind. Individual routes override these through `route.contentType`. */
const CONTENT_TYPES: Record<BodyKind, string | undefined> = {
	none: undefined,
	json: 'application/json',
	text: 'text/plain',
	xml: 'text/xml',
	multipart: undefined, // taken from the MultipartBody, because it carries the boundary
};

/** Defaults per accept kind. Individual routes override these through `route.acceptType`. */
const ACCEPT_TYPES: Record<AcceptKind, string> = {
	json: 'application/json',
	text: 'text/plain',
	xml: 'application/xml',
	binary: '*/*',
};

export function contentTypeFor(
	route: Pick<OperationRoute, 'body' | 'contentType'>,
): string | undefined {
	if (route.contentType !== undefined) return route.contentType;
	return route.body === undefined ? undefined : CONTENT_TYPES[route.body];
}

export function acceptFor(route: Pick<OperationRoute, 'accept' | 'acceptType'>): string {
	return route.acceptType ?? ACCEPT_TYPES[route.accept ?? 'json'];
}

export async function firstSpiritApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	options: RequestOptions,
): Promise<unknown> {
	const { route, params, body, overrides } = options;
	const credentials = (await this.getCredentials('firstSpiritApi')) as FirstSpiritCredentials;

	const headers: IDataObject = {
		Accept: acceptFor(route),
	};

	const contentType = contentTypeFor(route);
	if (contentType !== undefined) headers['Content-Type'] = contentType;

	const acceptKind = route.accept ?? 'json';
	const requestOptions: IHttpRequestOptions = {
		method: route.method,
		url: buildUrl(credentials.baseUrl, route, params),
		headers,
		json: acceptKind === 'json' && route.body !== 'multipart',
		...overrides,
	};

	// json:false only suppresses n8n's JSON defaults; without an explicit encoding axios still
	// JSON-parses a body that happens to look like JSON, which would make the output shape of a
	// text endpoint depend on what the server returned. Ask for text explicitly.
	if ((acceptKind === 'text' || acceptKind === 'xml') && overrides?.encoding === undefined) {
		requestOptions.encoding = 'text';
	}

	if (route.body !== undefined && route.body !== 'none' && body !== undefined) {
		// When json:false, n8n/Axios won't auto-serialize an object body — do it explicitly
		// so that a JSON body sent to a text-response endpoint is still transmitted correctly.
		if (route.body === 'multipart') {
			const multipart = body as MultipartBody;
			headers['Content-Type'] = multipart.contentType;
			requestOptions.body = multipart.buffer as unknown as IDataObject;
		} else if (
			acceptKind !== 'json' &&
			route.body === 'json' &&
			body !== null &&
			typeof body === 'object'
		) {
			requestOptions.body = JSON.stringify(body) as unknown as IDataObject;
		} else {
			requestOptions.body = body as IDataObject;
		}
	}

	try {
		const response = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'firstSpiritApi',
			requestOptions,
		);
		// Multipart requests must not set json:true (the buffer would be serialised),
		// but both multipart endpoints answer with JSON, so parse it here instead.
		if (route.body === 'multipart' && acceptKind === 'json' && typeof response === 'string') {
			return parseJsonOrKeep(response);
		}
		return response;
	} catch (error) {
		const message = apiMessage(error);
		const description = `${route.method} ${requestOptions.url}`;
		// httpRequestWithAuthentication already wraps the axios error in a NodeApiError, and
		// `new NodeApiError(node, <NodeApiError>)` returns that error unchanged, which would drop
		// the API's own text. The constructor therefore receives the message and description via
		// the same call, and for an already wrapped error they are applied afterwards.
		const apiError = new NodeApiError(this.getNode(), error as JsonObject, {
			// Passing no message lets NodeApiError derive its own status-specific headline
			// ("Authorization failed", "The resource you are requesting could not be found").
			...(message === undefined ? {} : { message }),
			description,
		});
		if (message !== undefined) apiError.message = message;
		apiError.description = description;
		throw apiError;
	}
}

function parseJsonOrKeep(response: string): unknown {
	if (response.trim().length === 0) return response;
	try {
		return JSON.parse(response);
	} catch {
		return response;
	}
}

/**
 * Extracts the API's own error text. `this.helpers.httpRequest` is axios-based and carries the
 * payload at `response.data`; `response.body` is the older request-promise shape and is read as
 * well so a wrapped error is still understood.
 */
function apiMessage(error: unknown): string | undefined {
	const candidate = error as {
		response?: { data?: unknown; body?: unknown };
		context?: { data?: unknown };
		cause?: { response?: { data?: unknown } };
	};
	const response = candidate?.response;
	// A NodeApiError keeps the response payload in `context.data` and the axios error as `cause`.
	for (const payload of [
		response?.data,
		response?.body,
		candidate?.context?.data,
		candidate?.cause?.response?.data,
	]) {
		if (typeof payload === 'string' && payload.trim().length > 0) return payload;
		const message = (payload as { message?: unknown } | undefined)?.message;
		if (typeof message === 'string' && message.length > 0) return message;
		const error_ = (payload as { error?: unknown } | undefined)?.error;
		if (typeof error_ === 'string' && error_.length > 0) return error_;
	}
	return undefined;
}
