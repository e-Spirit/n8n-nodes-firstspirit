import { INodeProperties } from 'n8n-workflow';
import { releasedField, renameBodyFields, resourceLocatorField, stringField } from './shared';

const show = { resource: ['pageReference'] };

const pageReferenceUidOperations = [
	'delete',
	'executeActions',
	'get',
	'getRevision',
	'getRevisions',
	'getSettings',
	'rename',
	'updateSettings',
];

const renameOperations = ['rename'];

export const pageReferenceDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show },
		default: 'getAll',
		options: [
			{ name: 'Create', value: 'create', action: 'Create a page reference' },
			{ name: 'Delete', value: 'delete', action: 'Delete a page reference' },
			{
				name: 'Execute Actions',
				value: 'executeActions',
				action: 'Execute actions on a page reference',
			},
			{ name: 'Get', value: 'get', action: 'Get a page reference' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many page references' },
			{ name: 'Get Revision', value: 'getRevision', action: 'Get a revision of a page reference' },
			{
				name: 'Get Revisions',
				value: 'getRevisions',
				action: 'Get all revisions of a page reference',
			},
			{ name: 'Get Settings', value: 'getSettings', action: 'Get settings for a page reference' },
			{ name: 'Rename', value: 'rename', action: 'Rename a page reference' },
			{
				name: 'Update Settings',
				value: 'updateSettings',
				action: 'Update settings for a page reference',
			},
		],
	},
	resourceLocatorField(
		'pageReferenceUid',
		'Page Reference',
		'The UID of the FirstSpirit page reference',
		'searchPageReferences',
		{ resource: ['pageReference'], operation: pageReferenceUidOperations },
	),
	stringField('uid', 'UID', 'The UID for the new page reference', {
		resource: ['pageReference'],
		operation: ['create'],
	}),
	resourceLocatorField(
		'pageId',
		'Page',
		'The FirstSpirit page to reference. Choose from the list, or specify a numeric ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		'searchPagesById',
		{ resource: ['pageReference'], operation: ['create'] },
		'e.g. 42',
	),
	stringField(
		'location',
		'Location',
		'The folder path for the new page reference, e.g. /products/',
		{
			resource: ['pageReference'],
			operation: ['create'],
		},
	),
	resourceLocatorField(
		'revisionId',
		'Revision',
		'The revision to retrieve. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		'searchPageReferenceRevisions',
		{ resource: ['pageReference'], operation: ['getRevision'] },
		'e.g. 42',
	),
	releasedField({ resource: ['pageReference'], operation: ['get'] }),
	{
		displayName: 'Action',
		name: 'action',
		type: 'options',
		required: true,
		default: 'copy',
		displayOptions: { show: { resource: ['pageReference'], operation: ['executeActions'] } },
		description: 'The action to execute on the page reference',
		options: [
			{ name: 'Copy', value: 'copy', action: 'Copy a page reference' },
			{ name: 'Release', value: 'release', action: 'Release a page reference' },
		],
	},
	stringField('filename', 'Filename', 'The filename for the page reference', {
		resource: ['pageReference'],
		operation: ['updateSettings'],
	}),
	{
		displayName: 'Show In Sitemap',
		name: 'showInSitemap',
		type: 'boolean',
		required: true,
		default: true,
		displayOptions: { show: { resource: ['pageReference'], operation: ['updateSettings'] } },
		description: 'Whether the page reference should be shown in the sitemap',
	},
	...renameBodyFields({ resource: ['pageReference'], operation: renameOperations }),
];
