import { INodeProperties } from 'n8n-workflow';
import {
	languageField,
	releasedField,
	renameBodyFields,
	resolutionUidField,
	resourceLocatorField,
	stringField,
} from './shared';

const show = { resource: ['media'] };

const mediumUidOperations = [
	'delete',
	'executeActions',
	'get',
	'getBinaryData',
	'getBinaryDataForResolution',
	'getResolutions',
	'getRevision',
	'getRevisions',
	'getUsages',
	'rename',
	'uploadBinaryData',
];

const languageSuffixOperations = [
	'getBinaryData',
	'getBinaryDataForResolution',
	'getResolutions',
	'uploadBinaryData',
];

const renameOperations = ['rename'];

const binaryOperations = ['getBinaryData', 'getBinaryDataForResolution', 'uploadBinaryData'];

export const mediaDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show },
		default: 'getAll',
		options: [
			{ name: 'Create', value: 'create', action: 'Create a medium' },
			{ name: 'Delete', value: 'delete', action: 'Delete a medium' },
			{ name: 'Execute Actions', value: 'executeActions', action: 'Execute actions on a medium' },
			{ name: 'Get', value: 'get', action: 'Get a medium' },
			{ name: 'Get Binary Data', value: 'getBinaryData', action: 'Get binary data of a medium' },
			{
				name: 'Get Binary Data For Resolution',
				value: 'getBinaryDataForResolution',
				action: 'Get binary data of a medium for a specific resolution',
			},
			{ name: 'Get Many', value: 'getAll', action: 'Get many media' },
			{
				name: 'Get Resolutions',
				value: 'getResolutions',
				action: 'Get resolutions of a picture medium',
			},
			{ name: 'Get Revision', value: 'getRevision', action: 'Get a revision of a medium' },
			{ name: 'Get Revisions', value: 'getRevisions', action: 'Get all revisions of a medium' },
			{ name: 'Get Usages', value: 'getUsages', action: 'Get usages of a medium' },
			{ name: 'Rename', value: 'rename', action: 'Rename a medium' },
			{
				name: 'Upload Binary Data',
				value: 'uploadBinaryData',
				action: 'Upload binary data to a medium',
			},
		],
	},
	resourceLocatorField('mediumUid', 'Medium', 'The UID of the FirstSpirit medium', 'searchMedia', {
		resource: ['media'],
		operation: mediumUidOperations,
	}),
	resolutionUidField({ resource: ['media'], operation: ['getBinaryDataForResolution'] }),
	resourceLocatorField(
		'revisionId',
		'Revision',
		'The revision to retrieve. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		'searchMediaRevisions',
		{ resource: ['media'], operation: ['getRevision'] },
		'e.g. 42',
	),
	languageField({ resource: ['media'], operation: languageSuffixOperations }),
	releasedField({ resource: ['media'], operation: ['get'] }),
	{
		displayName: 'Media Type',
		name: 'type',
		type: 'options',
		default: '',
		displayOptions: { show: { resource: ['media'], operation: ['getAll'] } },
		options: [
			{ name: 'Any', value: '' },
			{ name: 'File', value: 'FILE' },
			{ name: 'Picture', value: 'PICTURE' },
		],
		description: 'Filter by media type',
	},
	{
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		displayOptions: {
			show: {
				resource: ['media'],
				operation: binaryOperations,
			},
		},
		description: 'Name of the binary property to read the file from or write the file to',
	},
	stringField('uid', 'UID', 'The UID for the new medium', {
		resource: ['media'],
		operation: ['create'],
	}),
	stringField('filename', 'Filename', 'The filename for the new medium', {
		resource: ['media'],
		operation: ['create'],
	}),
	{
		displayName: 'Media Type',
		name: 'type',
		type: 'options',
		required: true,
		default: 'PICTURE',
		displayOptions: { show: { resource: ['media'], operation: ['create'] } },
		options: [
			{ name: 'File', value: 'FILE' },
			{ name: 'Picture', value: 'PICTURE' },
		],
		description: 'The type of medium to create',
	},
	{
		displayName: 'Action',
		name: 'action',
		type: 'options',
		required: true,
		default: 'copy',
		displayOptions: { show: { resource: ['media'], operation: ['executeActions'] } },
		description: 'The action to execute on the medium',
		options: [
			{ name: 'Copy', value: 'copy', action: 'Copy a media' },
			{ name: 'Release', value: 'release', action: 'Release a media' },
		],
	},
	...renameBodyFields({ resource: ['media'], operation: renameOperations }),
];
