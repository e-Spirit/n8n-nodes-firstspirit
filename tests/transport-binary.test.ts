import { buildUploadBody, fileNameFromHeaders } from '../nodes/FirstSpiritRestApi/transport/binary';

describe('fileNameFromHeaders', () => {
	it('reads a quoted filename', () => {
		expect(
			fileNameFromHeaders({ 'content-disposition': 'attachment; filename="logo.png"' }, 'file'),
		).toBe('logo.png');
	});

	it('reads an unquoted filename', () => {
		expect(
			fileNameFromHeaders({ 'content-disposition': 'attachment; filename=logo.png' }, 'file'),
		).toBe('logo.png');
	});

	it('prefers the RFC 5987 filename* form and decodes it', () => {
		expect(
			fileNameFromHeaders(
				{
					'content-disposition':
						'attachment; filename="gru.png"; filename*=UTF-8\'\'gr%C3%BC%C3%9Fe.png',
				},
				'file',
			),
		).toBe('grüße.png');
	});

	it('falls back when the header is missing', () => {
		expect(fileNameFromHeaders({}, 'medium.bin')).toBe('medium.bin');
	});

	it('falls back when the header carries no filename', () => {
		expect(fileNameFromHeaders({ 'content-disposition': 'inline' }, 'medium.bin')).toBe(
			'medium.bin',
		);
	});

	it('strips a path from the filename', () => {
		expect(
			fileNameFromHeaders(
				{ 'content-disposition': 'attachment; filename="../../etc/passwd"' },
				'file',
			),
		).toBe('passwd');
	});

	it('recovers from malformed filename* and uses plain filename', () => {
		expect(
			fileNameFromHeaders(
				{
					'content-disposition': 'attachment; filename="safe.png"; filename*=UTF-8\'\'%GG.png',
				},
				'fallback.bin',
			),
		).toBe('safe.png');
	});

	it('falls back on malformed filename* with no plain filename', () => {
		expect(
			fileNameFromHeaders(
				{
					'content-disposition': "attachment; filename*=UTF-8''%GG.png",
				},
				'fallback.bin',
			),
		).toBe('fallback.bin');
	});

	it('strips Windows-style path traversal', () => {
		expect(
			fileNameFromHeaders(
				{ 'content-disposition': 'attachment; filename="..\\..\\etc\\passwd"' },
				'file',
			),
		).toBe('passwd');
	});
});

describe('buildUploadBody', () => {
	function contextWith(buffer: Buffer, fileName?: string) {
		return {
			helpers: {
				assertBinaryData: jest.fn().mockReturnValue({ fileName }),
				getBinaryDataBuffer: jest.fn().mockResolvedValue(buffer),
			},
		};
	}

	it('builds a multipart body with a boundary-bearing content type', async () => {
		const ctx = contextWith(Buffer.from('hello'), 'a.txt');
		const result = await buildUploadBody.call(ctx as never, 2, 'data');

		const match = /^multipart\/form-data; boundary=(\S+)$/.exec(result.contentType);
		expect(match).not.toBeNull();
		const text = result.buffer.toString('latin1');
		expect(text.startsWith(`--${match![1]}\r\n`)).toBe(true);
		expect(text.endsWith(`\r\n--${match![1]}--\r\n`)).toBe(true);
		expect(text).toContain('Content-Disposition: form-data; name="file"; filename="a.txt"');
		expect(ctx.helpers.assertBinaryData).toHaveBeenCalledWith(2, 'data');
		expect(ctx.helpers.getBinaryDataBuffer).toHaveBeenCalledWith(2, 'data');
	});

	it('keeps the file bytes untouched', async () => {
		const bytes = Buffer.from([0x00, 0xff, 0xfe, 0x0d, 0x0a, 0x80]);
		const result = await buildUploadBody.call(contextWith(bytes, 'x.bin') as never, 0, 'data');
		expect(result.buffer.includes(bytes)).toBe(true);
	});

	it('falls back to upload.bin without a file name', async () => {
		const result = await buildUploadBody.call(contextWith(Buffer.from('x')) as never, 0, 'data');
		expect(result.buffer.toString('latin1')).toContain('filename="upload.bin"');
	});

	it('cannot be broken out of through the file name', async () => {
		const result = await buildUploadBody.call(
			contextWith(Buffer.from('x'), 'a"\r\nX-Evil: 1.txt') as never,
			0,
			'data',
		);
		const headerBlock = result.buffer.toString('latin1').split('\r\n\r\n')[0];
		expect(headerBlock.split('\r\n')).toHaveLength(3);
		expect(headerBlock).not.toContain('\nX-Evil');
	});
});
