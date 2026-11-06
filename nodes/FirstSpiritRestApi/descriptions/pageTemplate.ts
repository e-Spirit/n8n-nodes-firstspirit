import { INodeProperties } from 'n8n-workflow';
import { resourceLocatorField, stringField, templateSetUidField, textBodyField } from './shared';

const show = { resource: ['pageTemplate'] };

const pageTemplateUidOperations = [
	'delete',
	'get',
	'getBodies',
	'addBody',
	'getChannelSource',
	'getChannelSources',
	'getGom',
	'getGomForm',
	'getRules',
	'removeBody',
	'setChannelSource',
	'setGom',
	'setRules',
	'updateBody',
];

const bodyNameOperations = ['updateBody', 'removeBody'];

const templateSetUidOperations = ['getChannelSource', 'setChannelSource'];

export const pageTemplateDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show },
		default: 'getAll',
		options: [
			{ name: 'Add Body', value: 'addBody', action: 'Add a content area to a page template' },
			{ name: 'Create', value: 'create', action: 'Create a new page template' },
			{ name: 'Delete', value: 'delete', action: 'Delete a page template' },
			{ name: 'Get', value: 'get', action: 'Get a page template' },
			{
				name: 'Get Bodies',
				value: 'getBodies',
				action: 'Get all content areas of a page template',
			},
			{
				name: 'Get Channel Source',
				value: 'getChannelSource',
				action: 'Get a channel source of a page template',
			},
			{
				name: 'Get Channel Sources',
				value: 'getChannelSources',
				action: 'Get all channel sources of a page template',
			},
			{ name: 'Get GOM', value: 'getGom', action: 'Get the form definition of a page template' },
			{ name: 'Get GOM Form', value: 'getGomForm', action: 'Get the form of a page template' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many page templates' },
			{
				name: 'Get Rules',
				value: 'getRules',
				action: 'Get the ruleset definition of a page template',
			},
			{
				name: 'Remove Body',
				value: 'removeBody',
				action: 'Remove a content area from a page template',
			},
			{
				name: 'Set Channel Source',
				value: 'setChannelSource',
				action: 'Set a channel source of a page template',
			},
			{ name: 'Set GOM', value: 'setGom', action: 'Set the form definition of a page template' },
			{
				name: 'Set Rules',
				value: 'setRules',
				action: 'Set the ruleset definition of a page template',
			},
			{
				name: 'Update Body',
				value: 'updateBody',
				action: 'Update a content area of a page template',
			},
		],
	},
	resourceLocatorField(
		'pageTemplateUid',
		'Page Template',
		'The UID of the FirstSpirit page template',
		'searchPageTemplates',
		{ resource: ['pageTemplate'], operation: pageTemplateUidOperations },
	),
	templateSetUidField({ resource: ['pageTemplate'], operation: templateSetUidOperations }),
	stringField('uid', 'UID', 'The UID for the new page template', {
		resource: ['pageTemplate'],
		operation: ['create'],
	}),
	stringField('name', 'Name', 'The display name for the new page template', {
		resource: ['pageTemplate'],
		operation: ['create'],
	}),
	textBodyField('Source', 'The template source to write', {
		resource: ['pageTemplate'],
		operation: ['setGom', 'setRules', 'setChannelSource'],
	}),
	resourceLocatorField(
		'bodyName',
		'Content Area Name',
		'The content area to address. Choose from the list, or specify a name using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		'searchPageTemplateBodies',
		{ resource: ['pageTemplate'], operation: bodyNameOperations },
	),
	stringField('name', 'Name', 'The name of the content area', {
		resource: ['pageTemplate'],
		operation: ['addBody', 'updateBody'],
	}),
	{
		displayName: 'Allowed Section Templates',
		name: 'allowedTemplates',
		type: 'multiOptions',
		default: [],
		typeOptions: { loadOptionsMethod: 'getSectionTemplates' },
		displayOptions: { show: { resource: ['pageTemplate'], operation: ['addBody', 'updateBody'] } },
		description:
			'Which section templates may be used in this content area. Leave empty to allow all templates. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
];
