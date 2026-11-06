import { IDisplayOptions, INodeProperties } from 'n8n-workflow';

type Show = IDisplayOptions['show'];

export function stringField(
	name: string,
	displayName: string,
	description: string,
	show: Show,
): INodeProperties {
	return {
		displayName,
		name,
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show },
		description,
	};
}

export function resourceLocatorField(
	name: string,
	displayName: string,
	description: string,
	searchMethod: string,
	show: Show,
	idPlaceholder = 'e.g. homepage',
): INodeProperties {
	return {
		displayName,
		name,
		type: 'resourceLocator',
		required: true,
		default: { mode: 'list', value: '' },
		displayOptions: { show },
		description,
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				typeOptions: { searchListMethod: searchMethod, searchable: true },
			},
			{
				displayName: 'By ID',
				name: 'id',
				type: 'string',
				placeholder: idPlaceholder,
			},
		],
	};
}

export const projectField: INodeProperties = resourceLocatorField(
	'projectId',
	'Project',
	'The FirstSpirit project to work in',
	'searchProjects',
	{},
);

export function languageField(show: Show): INodeProperties {
	return {
		displayName: 'Language Name or ID',
		name: 'language',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		displayOptions: { show },
		description:
			'The project language to address. Leave empty to use the endpoint without a language. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				typeOptions: { searchListMethod: 'searchLanguages', searchable: true },
			},
			{
				displayName: 'By ID',
				name: 'id',
				type: 'string',
				placeholder: 'e.g. DE',
			},
		],
	};
}

export function templateSetUidField(show: Show): INodeProperties {
	return resourceLocatorField(
		'templateSetUid',
		'Template Set Name or ID',
		'The template set to address. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		'searchTemplateSets',
		show,
		'e.g. html',
	);
}

export function resolutionUidField(show: Show): INodeProperties {
	return resourceLocatorField(
		'resolutionUid',
		'Resolution Name or ID',
		'The resolution to use. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		'searchResolutions',
		show,
		'e.g. ORIGINAL',
	);
}

export function releasedField(show: Show): INodeProperties {
	return {
		displayName: 'Released',
		name: 'released',
		type: 'boolean',
		default: false,
		displayOptions: { show },
		description: 'Whether to read the released state instead of the current state',
	};
}

export function renameBodyFields(show: Show): INodeProperties[] {
	return [
		{
			displayName: 'New Name',
			name: 'name',
			type: 'string',
			required: true,
			default: '',
			displayOptions: { show },
			description: 'The new display name',
		},
		{
			displayName: 'Language Name or ID',
			name: 'language',
			type: 'resourceLocator',
			required: true,
			default: { mode: 'list', value: '' },
			displayOptions: { show },
			description:
				'The project language in which to set the name. Choose from the list, or specify an abbreviation using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			modes: [
				{
					displayName: 'From List',
					name: 'list',
					type: 'list',
					typeOptions: { searchListMethod: 'searchLanguages', searchable: true },
				},
				{
					displayName: 'By ID',
					name: 'id',
					type: 'string',
					placeholder: 'e.g. DE',
				},
			],
		},
	];
}

export function jsonBodyField(show: Show): INodeProperties {
	return {
		displayName: 'Body',
		name: 'body',
		type: 'json',
		required: true,
		default: '{}',
		typeOptions: { alwaysOpenEditWindow: true },
		displayOptions: { show },
		description: 'The JSON request body as defined by the FirstSpirit REST API',
	};
}

export function textBodyField(
	displayName: string,
	description: string,
	show: Show,
): INodeProperties {
	return {
		displayName,
		name: 'textBody',
		type: 'string',
		required: true,
		default: '',
		typeOptions: { rows: 10 },
		displayOptions: { show },
		description,
	};
}

export function returnAllFields(show: Show): INodeProperties[] {
	return [
		{
			displayName: 'Return All',
			name: 'returnAll',
			type: 'boolean',
			default: false,
			displayOptions: { show },
			description: 'Whether to return all results or only up to a given limit',
		},
		{
			displayName: 'Limit',
			name: 'limit',
			type: 'number',
			default: 50,
			typeOptions: { minValue: 1 },
			displayOptions: { show: { ...show, returnAll: [false] } },
			description: 'Max number of results to return',
		},
	];
}
