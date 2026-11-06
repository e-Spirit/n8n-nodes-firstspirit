import { INodeProperties } from 'n8n-workflow';
import { resourceLocatorField, stringField } from './shared';

const show = { resource: ['dataSource'] };

const datasourceOperations = ['get'];

export const dataSourceDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show },
		default: 'getAll',
		options: [
			{ name: 'Create', value: 'create', action: 'Create a new data source' },
			{ name: 'Get', value: 'get', action: 'Get data source details' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many data sources' },
		],
	},
	resourceLocatorField(
		'datasource',
		'Data Source',
		'The data source to address',
		'searchDataSources',
		{ resource: ['dataSource'], operation: datasourceOperations },
	),
	stringField('uid', 'UID', 'The UID for the new data source', {
		resource: ['dataSource'],
		operation: ['create'],
	}),
	resourceLocatorField(
		'schemaUid',
		'Schema',
		'The schema to use. Choose from the list, or specify a UID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		'searchSchemas',
		{ resource: ['dataSource'], operation: ['create'] },
	),
	stringField('tableTemplateUid', 'Table Template UID', 'The UID of the table template to use', {
		resource: ['dataSource'],
		operation: ['create'],
	}),
];
