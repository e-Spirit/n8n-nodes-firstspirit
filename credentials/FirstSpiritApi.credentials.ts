import {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class FirstSpiritApi implements ICredentialType {
	name = 'firstSpiritApi';
	displayName = 'FirstSpirit REST API';
	icon: Icon = {
		light: 'file:../nodes/FirstSpiritRestApi/rezolve.svg',
		dark: 'file:../nodes/FirstSpiritRestApi/rezolve.dark.svg',
	};
	documentationUrl = 'https://github.com/e-Spirit/n8n-nodes-firstspirit#credentials';
	properties: INodeProperties[] = [
		{
			displayName: 'Username',
			name: 'username',
			type: 'string',
			default: '',
			placeholder: 'Enter your username',
			description: 'The username for basic authentication',
			required: true,
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			placeholder: 'Enter your password',
			description: 'The password for basic authentication',
			required: true,
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: '',
			placeholder: 'https://your-server.example.com/rest',
			description:
				'The base URL of the FirstSpirit REST API. It is the server URL plus the REST context path, usually "/rest" — the browser URL of the server on its own is not enough. Use an https:// URL. With http://, the username and password are sent unencrypted, which is only acceptable for a local test server',
			required: true,
		},
	];

	// n8n applies this to every request the node sends and to the Test button below.
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			auth: {
				username: '={{$credentials.username}}',
				password: '={{$credentials.password}}',
			},
		},
	};

	// Cheapest authenticated endpoint of the API: it needs no project and returns a small list.
	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl.replace(/\\/+$/, "")}}',
			url: '/v1/projects/',
			method: 'GET',
		},
	};
}
