import { FirstSpiritApi } from '../credentials/FirstSpiritApi.credentials';

describe('FirstSpiritApi', () => {
	const credentials = new FirstSpiritApi();

	function property(name: string) {
		const found = credentials.properties.find((p) => p.name === name);
		if (found === undefined) throw new Error(`no credential property ${name}`);
		return found;
	}

	it('shows the same themed icon as the node', () => {
		expect(credentials.icon).toEqual({
			light: 'file:../nodes/FirstSpiritRestApi/rezolve.svg',
			dark: 'file:../nodes/FirstSpiritRestApi/rezolve.dark.svg',
		});
	});

	it('declares the fields the transport reads', () => {
		expect(credentials.properties.map((p) => p.name)).toEqual(['username', 'password', 'baseUrl']);
	});

	it('links the help icon to the credentials section of the README', () => {
		expect(credentials.documentationUrl).toBe(
			'https://github.com/e-Spirit/n8n-nodes-firstspirit#credentials',
		);
	});

	it('shows the shape of the base URL, including the rest path segment', () => {
		const baseUrl = property('baseUrl');
		expect(baseUrl.placeholder).toMatch(/\/rest$/);
		expect(baseUrl.description).toMatch(/rest/i);
	});

	it('warns that a plain http base URL sends the password unencrypted', () => {
		expect(property('baseUrl').description).toMatch(/https/i);
		expect(property('baseUrl').description).toMatch(/unencrypted|clear text|plain text/i);
	});

	it('masks the password', () => {
		expect(property('password').typeOptions?.password).toBe(true);
	});

	it('offers a credential test against a cheap endpoint', () => {
		expect(credentials.test.request.url).toBe('/v1/projects/');
		expect(credentials.test.request.baseURL).toContain('$credentials.baseUrl');
	});

	it('authenticates the credential test with basic auth', () => {
		expect(credentials.authenticate.type).toBe('generic');
		expect(
			(credentials.authenticate as { properties: { auth?: unknown } }).properties.auth,
		).toEqual({
			username: '={{$credentials.username}}',
			password: '={{$credentials.password}}',
		});
	});

	it('ends no description with a period', () => {
		for (const p of credentials.properties) {
			expect(p.description ?? '').not.toMatch(/\.$/);
		}
	});
});
