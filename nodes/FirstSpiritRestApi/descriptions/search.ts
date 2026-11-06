import { INodeProperties } from 'n8n-workflow';
import { returnAllFields, stringField } from './shared';

const show = { resource: ['search'] };

export const searchDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show },
		default: 'search',
		options: [
			{ name: 'Search', value: 'search', action: 'Search in a project' },
			{ name: 'Search By ID', value: 'searchById', action: 'Search by element ID' },
			{ name: 'Search By UID', value: 'searchByUid', action: 'Search by element UID' },
			{
				name: 'Search External References',
				value: 'searchExternalReferences',
				action: 'Search for external references',
			},
			{
				name: 'Search Invalid References',
				value: 'searchInvalidReferences',
				action: 'Search for invalid broken references',
			},
		],
	},
	stringField('elementId', 'Element ID', 'The ID of the element to search for', {
		resource: ['search'],
		operation: ['searchById'],
	}),
	{
		displayName: 'Query',
		name: 'q',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['search'], operation: ['search'] } },
		description: 'The search query string',
	},
	{
		displayName: 'UID',
		name: 'uid',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['search'], operation: ['searchByUid'] } },
		description: 'The UID of the element to search for',
	},
	{
		displayName: 'Store Type',
		name: 'type',
		type: 'options',
		default: '',
		displayOptions: { show: { resource: ['search'], operation: ['searchByUid'] } },
		options: [
			{ name: 'Any', value: '' },
			{ name: 'Content Store', value: 'CONTENTSTORE' },
			{ name: 'Content Store Data', value: 'CONTENTSTORE_DATA' },
			{ name: 'Global Store', value: 'GLOBALSTORE' },
			{ name: 'Media Store Folder', value: 'MEDIASTORE_FOLDER' },
			{ name: 'Media Store Leaf', value: 'MEDIASTORE_LEAF' },
			{ name: 'Page Store', value: 'PAGESTORE' },
			{ name: 'Site Store Folder', value: 'SITESTORE_FOLDER' },
			{ name: 'Site Store Leaf', value: 'SITESTORE_LEAF' },
			{ name: 'Template Store', value: 'TEMPLATESTORE' },
			{ name: 'Template Store Format Template', value: 'TEMPLATESTORE_FORMATTEMPLATE' },
			{ name: 'Template Store Link Template', value: 'TEMPLATESTORE_LINKTEMPLATE' },
			{ name: 'Template Store Schema', value: 'TEMPLATESTORE_SCHEMA' },
			{ name: 'Template Store Style Template', value: 'TEMPLATESTORE_STYLETEMPLATE' },
			{ name: 'Template Store Table Format Template', value: 'TEMPLATESTORE_TABLEFORMATTEMPLATE' },
		],
		description: 'Filter by store type',
	},
	...returnAllFields({
		resource: ['search'],
		operation: ['search', 'searchExternalReferences', 'searchInvalidReferences'],
	}),
];
