import { INodeProperties } from 'n8n-workflow';
import { resourceLocatorField } from './shared';

const show = { resource: ['schema'] };

export const schemaDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show },
		default: 'getAll',
		options: [
			{ name: 'Get', value: 'get', action: 'Get a database schema' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many database schemas' },
		],
	},
	resourceLocatorField(
		'schemaUid',
		'Schema',
		'The FirstSpirit database schema to look up. Choose from the list, or specify a UID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		'searchSchemas',
		{ resource: ['schema'], operation: ['get'] },
	),
];
