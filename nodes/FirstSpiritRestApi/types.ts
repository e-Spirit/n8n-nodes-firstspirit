import { IHttpRequestMethods } from 'n8n-workflow';

export type BodyKind = 'none' | 'json' | 'text' | 'xml' | 'multipart';
export type AcceptKind = 'json' | 'text' | 'xml' | 'binary';

export interface OperationRoute {
	/** n8n resource this operation belongs to, e.g. 'page'. */
	resource: string;
	/** Operation value inside that resource, e.g. 'getRevision'. */
	operation: string;
	method: IHttpRequestMethods;
	/** Path template with {placeholders} that map to node parameters of the same name. */
	path: string;
	/** Appends '/{language}' when the optional Language field is filled. */
	languageSuffix?: boolean;
	/** Node parameter names appended as query string parameters when set. */
	query?: string[];
	body?: BodyKind;
	/**
	 * When set, the JSON body is assembled from these named node parameters instead of reading
	 * the generic 'body' JSON field. Parameters are read with extractValue:true (handles
	 * resourceLocator) and omitted from the body when their value is undefined or an empty string.
	 */
	bodyParams?: string[];
	/** Type coercions for individual bodyParams. Only 'number' and 'boolean' need to be declared. */
	bodyParamTypes?: Record<string, 'number' | 'boolean'>;
	/**
	 * Maps body key → node parameter name when they differ.
	 * E.g. { name: 'editorName' } reads 'editorName' from the node but writes it as 'name' in the body.
	 */
	bodyParamRenames?: Record<string, string>;
	/**
	 * Exact request media type, when the spec declares one that differs from the default for
	 * `body` (e.g. 'application/xml' where the default for 'xml' bodies is 'text/xml').
	 */
	contentType?: string;
	accept?: AcceptKind;
	/**
	 * Exact response media type sent as the Accept header, when the spec declares one that
	 * differs from the default for `accept` (e.g. 'text/xml' for the script GOM endpoints).
	 */
	acceptType?: string;
	paginated?: boolean;
	/** Every OpenAPI endpoint this operation covers, as 'METHOD /path'. */
	specPaths: string[];
}

/** A ready-to-send multipart/form-data payload together with its boundary-bearing content type. */
export interface MultipartBody {
	buffer: Buffer;
	contentType: string;
}
