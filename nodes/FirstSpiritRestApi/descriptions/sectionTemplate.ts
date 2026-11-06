import { INodeProperties } from 'n8n-workflow';
import { resourceLocatorField, stringField, templateSetUidField, textBodyField } from './shared';

const show = { resource: ['sectionTemplate'] };

const sectionTemplateUidOperations = [
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

export const sectionTemplateDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show },
		default: 'getAll',
		options: [
			{ name: 'Create', value: 'create', action: 'Create a new section template' },
			{ name: 'Delete', value: 'delete', action: 'Delete a section template' },
			{ name: 'Get', value: 'get', action: 'Get a section template' },
			{
				name: 'Get Channel Source',
				value: 'getChannelSource',
				action: 'Get a channel source of a section template',
			},
			{
				name: 'Get Channel Sources',
				value: 'getChannelSources',
				action: 'Get all channel sources of a section template',
			},
			{ name: 'Get GOM', value: 'getGom', action: 'Get the form definition of a section template' },
			{ name: 'Get GOM Form', value: 'getGomForm', action: 'Get the form of a section template' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many section templates' },
			{
				name: 'Get Rules',
				value: 'getRules',
				action: 'Get the ruleset definition of a section template',
			},
			{
				name: 'Set Channel Source',
				value: 'setChannelSource',
				action: 'Set a channel source of a section template',
			},
			{ name: 'Set GOM', value: 'setGom', action: 'Set the form definition of a section template' },
			{
				name: 'Set Rules',
				value: 'setRules',
				action: 'Set the ruleset definition of a section template',
			},
		],
	},
	resourceLocatorField(
		'sectionTemplateUid',
		'Section Template',
		'The UID of the FirstSpirit section template',
		'searchSectionTemplates',
		{ resource: ['sectionTemplate'], operation: sectionTemplateUidOperations },
	),
	templateSetUidField({ resource: ['sectionTemplate'], operation: templateSetUidOperations }),
	stringField('uid', 'UID', 'The UID for the new section template', {
		resource: ['sectionTemplate'],
		operation: ['create'],
	}),
	stringField('name', 'Name', 'The display name for the new section template', {
		resource: ['sectionTemplate'],
		operation: ['create'],
	}),
	textBodyField('Source', 'The template source to write', {
		resource: ['sectionTemplate'],
		operation: ['setGom', 'setRules', 'setChannelSource'],
	}),
];
