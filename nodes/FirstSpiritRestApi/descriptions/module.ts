import { INodeProperties } from 'n8n-workflow';
import { resourceLocatorField } from './shared';

const show = { resource: ['module'] };

const moduleNameOperations = ['delete', 'get'];

export const moduleDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show },
		default: 'getAll',
		options: [
			{ name: 'Install', value: 'create', action: 'Install a first spirit module' },
			{ name: 'Delete', value: 'delete', action: 'Uninstall a first spirit module' },
			{ name: 'Get', value: 'get', action: 'Get a single installed first spirit module' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many installed first spirit modules' },
		],
	},
	resourceLocatorField(
		'moduleName',
		'Module',
		'The FirstSpirit module to address. Choose from the list, or specify a name using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		'searchModules',
		{ resource: ['module'], operation: moduleNameOperations },
		'e.g. fs-tpp-app',
	),
	{
		displayName: 'Update Usages Mode',
		name: 'updateUsagesMode',
		type: 'options',
		default: 'DO_NOTHING',
		displayOptions: { show: { resource: ['module'], operation: ['create', 'delete'] } },
		options: [
			{ name: 'Do Nothing', value: 'DO_NOTHING' },
			{ name: 'Update Components', value: 'UPDATE_COMPONENTS' },
			{ name: 'Update Components And Redeploy', value: 'UPDATE_COMPONENTS_AND_REDEPLOY' },
		],
		description: 'How to handle usages of the module after the operation',
	},
	{
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		displayOptions: { show: { resource: ['module'], operation: ['create'] } },
		description: 'Name of the binary property that holds the FSM file',
	},
];
