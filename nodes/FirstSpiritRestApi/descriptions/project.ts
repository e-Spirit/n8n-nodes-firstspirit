import { INodeProperties } from 'n8n-workflow';
import { projectField, resourceLocatorField, stringField } from './shared';

const show = { resource: ['project'] };

export const projectDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show },
		default: 'getAll',
		options: [
			{ name: 'Create', value: 'create', action: 'Create a project' },
			{ name: 'Delete', value: 'delete', action: 'Delete a project' },
			{ name: 'Get', value: 'get', action: 'Get a project' },
			{ name: 'Get Language', value: 'getLanguage', action: 'Get a project language' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many projects' },
			{ name: 'Get Many Languages', value: 'getLanguages', action: 'Get many project languages' },
			{
				name: 'Get Many Template Sets',
				value: 'getTemplateSets',
				action: 'Get many template sets',
			},
			{ name: 'Get Resolutions', value: 'getResolutions', action: 'Get the project resolutions' },
			{ name: 'Get Settings', value: 'getSettings', action: 'Get the project settings' },
			{ name: 'Get Template Set', value: 'getTemplateSet', action: 'Get a template set' },
		],
	},
	{
		...projectField,
		displayOptions: {
			show: {
				resource: ['project'],
				operation: [
					'getLanguages',
					'getLanguage',
					'getTemplateSets',
					'getTemplateSet',
					'getResolutions',
					'getSettings',
				],
			},
		},
	},
	resourceLocatorField('id', 'Project', 'The FirstSpirit project to work with', 'searchProjects', {
		resource: ['project'],
		operation: ['get', 'delete'],
	}),
	resourceLocatorField(
		'abbreviation',
		'Language',
		'The project language to look up. Choose from the list, or specify an abbreviation using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		'searchLanguages',
		{ resource: ['project'], operation: ['getLanguage'] },
		'e.g. DE',
	),
	resourceLocatorField(
		'abbreviation',
		'Template Set',
		'The template set to look up. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		'searchTemplateSets',
		{ resource: ['project'], operation: ['getTemplateSet'] },
		'e.g. html',
	),
	stringField('name', 'Name', 'The display name of the new project', {
		resource: ['project'],
		operation: ['create'],
	}),
	stringField('description', 'Description', 'The description of the new project', {
		resource: ['project'],
		operation: ['create'],
	}),
];
