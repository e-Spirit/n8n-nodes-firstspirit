import { INodeProperties } from 'n8n-workflow';
import { resourceLocatorField, stringField } from './shared';

const show = { resource: ['documentGroup'] };

export const documentGroupDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show },
		default: 'getAll',
		options: [
			{ name: 'Create', value: 'create', action: 'Create a document group' },
			{ name: 'Delete', value: 'delete', action: 'Delete a document group' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many document groups' },
		],
	},
	resourceLocatorField(
		'uid',
		'Document Group',
		'The document group to delete. Choose from the list, or specify a UID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		'searchDocumentGroups',
		{ resource: ['documentGroup'], operation: ['delete'] },
	),
	stringField('uid', 'UID', 'The UID for the new document group', {
		resource: ['documentGroup'],
		operation: ['create'],
	}),
];
