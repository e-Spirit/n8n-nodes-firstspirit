import { IBinaryKeyData, IExecuteFunctions } from 'n8n-workflow';
import { randomBytes } from 'node:crypto';
import { MultipartBody, OperationRoute } from '../types';
import { firstSpiritApiRequest } from './request';

export function fileNameFromHeaders(headers: Record<string, unknown>, fallback: string): string {
	const disposition = headers['content-disposition'];
	if (typeof disposition !== 'string') return fallback;

	const extended = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(disposition);
	const plain = /filename\s*=\s*"?([^";]+)"?/i.exec(disposition);

	let raw: string | undefined;
	if (extended) {
		try {
			raw = decodeURIComponent(extended[1]);
		} catch {
			// If decode fails, fall back to plain filename if available
			raw = plain?.[1];
		}
	} else {
		raw = plain?.[1];
	}

	if (raw === undefined) return fallback;

	// Normalize both separator styles for path traversal protection
	const normalized = raw.trim().replace(/\\/g, '/');
	const base = normalized.slice(normalized.lastIndexOf('/') + 1);
	return base.length > 0 && base !== '.' && base !== '..' ? base : fallback;
}

export async function downloadBinary(
	this: IExecuteFunctions,
	route: OperationRoute,
	params: Record<string, unknown>,
	binaryPropertyName: string,
): Promise<IBinaryKeyData> {
	const response = (await firstSpiritApiRequest.call(this, {
		route,
		params,
		overrides: { encoding: 'arraybuffer', returnFullResponse: true, json: false },
	})) as { body: Buffer; headers: Record<string, unknown> };

	const fallback = `${String(params.mediumUid ?? 'download')}`;
	const fileName = fileNameFromHeaders(response.headers ?? {}, fallback);

	return {
		[binaryPropertyName]: await this.helpers.prepareBinaryData(
			Buffer.from(response.body),
			fileName,
		),
	} as IBinaryKeyData;
}

/** Keeps a file name inside its quoted header value: no quotes, no line breaks. */
function quoteFileName(name: string): string {
	return name.replace(/\r|\n/g, '').replace(/"/g, '%22');
}

/**
 * Builds a single-part multipart/form-data body from a binary property of the input item.
 * The body is assembled by hand so the node needs no runtime dependency and never touches the
 * file system: every upload comes from n8n's binary data.
 */
export async function buildUploadBody(
	this: IExecuteFunctions,
	itemIndex: number,
	binaryPropertyName: string,
): Promise<MultipartBody> {
	const binaryData = this.helpers.assertBinaryData(itemIndex, binaryPropertyName);
	const file = await this.helpers.getBinaryDataBuffer(itemIndex, binaryPropertyName);
	const fileName = quoteFileName(binaryData.fileName ?? 'upload.bin') || 'upload.bin';
	const boundary = `----n8nFirstSpirit${randomBytes(16).toString('hex')}`;

	const head = Buffer.from(
		`--${boundary}\r\n` +
			`Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n` +
			'Content-Type: application/octet-stream\r\n\r\n',
		'utf8',
	);
	const tail = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8');

	return {
		buffer: Buffer.concat([head, file, tail]),
		contentType: `multipart/form-data; boundary=${boundary}`,
	};
}
