import { INodeProperties } from 'n8n-workflow';
import { resourceLocatorField, stringField, templateSetUidField, textBodyField } from './shared';

const show = { resource: ['formatTemplate'] };

const formatTemplateUidOperations = [
	'delete',
	'get',
	'getChannelSource',
	'getChannelSources',
	'setChannelSource',
];

const templateSetUidOperations = ['getChannelSource', 'setChannelSource'];

export const formatTemplateDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show },
		default: 'getAll',
		options: [
			{ name: 'Create', value: 'create', action: 'Create a new format template' },
			{ name: 'Delete', value: 'delete', action: 'Delete a format template' },
			{ name: 'Get', value: 'get', action: 'Get a format template' },
			{
				name: 'Get Channel Source',
				value: 'getChannelSource',
				action: 'Get a channel source of a format template',
			},
			{
				name: 'Get Channel Sources',
				value: 'getChannelSources',
				action: 'Get all channel sources of a format template',
			},
			{ name: 'Get Many', value: 'getAll', action: 'Get many format templates' },
			{
				name: 'Set Channel Source',
				value: 'setChannelSource',
				action: 'Set a channel source of a format template',
			},
		],
	},
	resourceLocatorField(
		'formatTemplateUid',
		'Format Template',
		'The UID of the FirstSpirit format template',
		'searchFormatTemplates',
		{ resource: ['formatTemplate'], operation: formatTemplateUidOperations },
	),
	templateSetUidField({ resource: ['formatTemplate'], operation: templateSetUidOperations }),
	stringField('uid', 'UID', 'The UID for the new format template', {
		resource: ['formatTemplate'],
		operation: ['create'],
	}),
	textBodyField('Source', 'The template source to write', {
		resource: ['formatTemplate'],
		operation: ['setChannelSource'],
	}),
];
