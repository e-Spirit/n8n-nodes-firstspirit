import { INodeProperties } from 'n8n-workflow';
import { renameBodyFields } from './shared';

const show = { resource: ['folder'] };

const renameOperations = ['renameMediumFolder', 'renamePageFolder', 'renamePageReferenceFolder'];

export const folderDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show },
		default: 'getPageFolder',
		options: [
			{
				name: 'Get Medium Folder',
				value: 'getMediumFolder',
				action: 'Get a medium folder by path',
			},
			{ name: 'Get Page Folder', value: 'getPageFolder', action: 'Get a page folder by path' },
			{
				name: 'Get Page Reference Folder',
				value: 'getPageReferenceFolder',
				action: 'Get a page reference folder by path',
			},
			{
				name: 'Rename Medium Folder',
				value: 'renameMediumFolder',
				action: 'Rename a medium folder',
			},
			{ name: 'Rename Page Folder', value: 'renamePageFolder', action: 'Rename a page folder' },
			{
				name: 'Rename Page Reference Folder',
				value: 'renamePageReferenceFolder',
				action: 'Rename a page reference folder',
			},
		],
	},
	{
		displayName: 'Folder Path',
		name: 'folderPath',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. products/accessories',
		displayOptions: { show: { resource: ['folder'] } },
		description: 'Path of the folder inside the store, without a leading slash',
	},
	...renameBodyFields({ resource: ['folder'], operation: renameOperations }),
];
