import { INodeProperties } from 'n8n-workflow';
import {
	jsonBodyField,
	resourceLocatorField,
	stringField,
	templateSetUidField,
	textBodyField,
} from './shared';

const show = { resource: ['script'] };

const scriptNameOperations = ['delete', 'execute', 'get', 'getCode', 'getGom', 'setCode', 'setGom'];

const templateSetUidOperations = ['getCode', 'setCode'];

export const scriptDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show },
		default: 'getAll',
		options: [
			{ name: 'Create', value: 'create', action: 'Create a new script' },
			{ name: 'Delete', value: 'delete', action: 'Delete a script' },
			{ name: 'Execute', value: 'execute', action: 'Execute a script' },
			{ name: 'Get', value: 'get', action: 'Get a specific script' },
			{
				name: 'Get Code',
				value: 'getCode',
				action: 'Get the actual script code for a template set',
			},
			{ name: 'Get GOM', value: 'getGom', action: 'Get script GOM definition' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many first spirit scripts for a project' },
			{
				name: 'Set Code',
				value: 'setCode',
				action: 'Set the actual script code for a template set',
			},
			{ name: 'Set GOM', value: 'setGom', action: 'Set script GOM definition' },
		],
	},
	resourceLocatorField(
		'scriptName',
		'Script',
		'The name of the FirstSpirit script',
		'searchScripts',
		{ resource: ['script'], operation: scriptNameOperations },
	),
	templateSetUidField({ resource: ['script'], operation: templateSetUidOperations }),
	stringField('name', 'Name', 'The name for the new script', {
		resource: ['script'],
		operation: ['create'],
	}),
	jsonBodyField({ resource: ['script'], operation: ['execute'] }),
	textBodyField('Script Code', 'The script code to write', {
		resource: ['script'],
		operation: ['setCode', 'setGom'],
	}),
];
