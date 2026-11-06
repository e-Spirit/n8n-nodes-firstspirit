import { INodeProperties } from 'n8n-workflow';
import { resourceLocatorField, stringField, templateSetUidField, textBodyField } from './shared';

const show = { resource: ['linkTemplate'] };

const linkTemplateUidOperations = [
	'delete',
	'get',
	'getChannelSource',
	'getChannelSources',
	'getGom',
	'getGomForm',
	'getRules',
	'setChannelSource',
	'setGom',
	'setRules',
];

const templateSetUidOperations = ['getChannelSource', 'setChannelSource'];

export const linkTemplateDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show },
		default: 'getAll',
		options: [
			{ name: 'Create', value: 'create', action: 'Create a new link template' },
			{ name: 'Delete', value: 'delete', action: 'Delete a link template' },
			{ name: 'Get', value: 'get', action: 'Get a link template' },
			{
				name: 'Get Channel Source',
				value: 'getChannelSource',
				action: 'Get a channel source of a link template',
			},
			{
				name: 'Get Channel Sources',
				value: 'getChannelSources',
				action: 'Get all channel sources of a link template',
			},
			{ name: 'Get GOM', value: 'getGom', action: 'Get the form definition of a link template' },
			{ name: 'Get GOM Form', value: 'getGomForm', action: 'Get the form of a link template' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many link templates' },
			{
				name: 'Get Rules',
				value: 'getRules',
				action: 'Get the ruleset definition of a link template',
			},
			{
				name: 'Set Channel Source',
				value: 'setChannelSource',
				action: 'Set a channel source of a link template',
			},
			{ name: 'Set GOM', value: 'setGom', action: 'Set the form definition of a link template' },
			{
				name: 'Set Rules',
				value: 'setRules',
				action: 'Set the ruleset definition of a link template',
			},
		],
	},
	resourceLocatorField(
		'linkTemplateUid',
		'Link Template',
		'The UID of the FirstSpirit link template',
		'searchLinkTemplates',
		{ resource: ['linkTemplate'], operation: linkTemplateUidOperations },
	),
	templateSetUidField({ resource: ['linkTemplate'], operation: templateSetUidOperations }),
	stringField('uid', 'UID', 'The UID for the new link template', {
		resource: ['linkTemplate'],
		operation: ['create'],
	}),
	textBodyField('Source', 'The template source to write', {
		resource: ['linkTemplate'],
		operation: ['setGom', 'setRules', 'setChannelSource'],
	}),
];
