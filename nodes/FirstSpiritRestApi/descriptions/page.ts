import { INodeProperties } from 'n8n-workflow';
import {
	languageField,
	releasedField,
	renameBodyFields,
	resourceLocatorField,
	stringField,
} from './shared';

const show = { resource: ['page'] };

const pageUidOperations = [
	'delete',
	'executeActions',
	'get',
	'getBodies',
	'getBody',
	'getForm',
	'getFormEditor',
	'getMetadata',
	'getMetadataEditor',
	'getRevision',
	'getRevisions',
	'getUsages',
	'rename',
	'updateFormEditor',
	'updateMetadataEditor',
];

const bodyNameOperations = ['getBody'];

const formEditorNameOperations = ['getFormEditor', 'updateFormEditor'];

const metadataEditorNameOperations = ['getMetadataEditor', 'updateMetadataEditor'];

const languageSuffixOperations = [
	'getFormEditor',
	'getMetadataEditor',
	'updateFormEditor',
	'updateMetadataEditor',
];

const contentOperations = ['updateFormEditor', 'updateMetadataEditor'];

const renameOperations = ['rename'];

export const pageDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show },
		default: 'getAll',
		options: [
			{ name: 'Create', value: 'create', action: 'Create a page' },
			{ name: 'Delete', value: 'delete', action: 'Delete a page' },
			{ name: 'Execute Actions', value: 'executeActions', action: 'Execute actions on a page' },
			{ name: 'Get', value: 'get', action: 'Get a page' },
			{ name: 'Get Bodies', value: 'getBodies', action: 'Get bodies of a page' },
			{ name: 'Get Body', value: 'getBody', action: 'Get a body of a page' },
			{ name: 'Get Form', value: 'getForm', action: 'Get the form of a page' },
			{ name: 'Get Form Editor', value: 'getFormEditor', action: 'Get a form editor of a page' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many pages' },
			{ name: 'Get Metadata', value: 'getMetadata', action: 'Get the metadata of a page' },
			{
				name: 'Get Metadata Editor',
				value: 'getMetadataEditor',
				action: 'Get a metadata editor of a page',
			},
			{ name: 'Get Revision', value: 'getRevision', action: 'Get a revision of a page' },
			{ name: 'Get Revisions', value: 'getRevisions', action: 'Get all revisions of a page' },
			{ name: 'Get Usages', value: 'getUsages', action: 'Get usages of a page' },
			{ name: 'Rename', value: 'rename', action: 'Rename a page' },
			{
				name: 'Update Form Editor',
				value: 'updateFormEditor',
				action: 'Update a form editor of a page',
			},
			{
				name: 'Update Metadata Editor',
				value: 'updateMetadataEditor',
				action: 'Update a metadata editor of a page',
			},
		],
	},
	resourceLocatorField('pageUid', 'Page', 'The UID of the FirstSpirit page', 'searchPages', {
		resource: ['page'],
		operation: pageUidOperations,
	}),
	resourceLocatorField(
		'bodyName',
		'Body',
		'The page body to address. Choose from the list, or specify a name using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		'searchBodies',
		{ resource: ['page'], operation: bodyNameOperations },
		'e.g. content',
	),
	resourceLocatorField(
		'editorName',
		'Form Editor',
		'The form editor to address. Choose from the list, or specify a name using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		'searchPageFormEditors',
		{ resource: ['page'], operation: formEditorNameOperations },
		'e.g. pt_headline',
	),
	resourceLocatorField(
		'editorName',
		'Metadata Editor',
		'The metadata editor to address. Choose from the list, or specify a name using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		'searchPageMetadataEditors',
		{ resource: ['page'], operation: metadataEditorNameOperations },
		'e.g. pt_title',
	),
	{
		displayName: 'Editor Type',
		name: 'type',
		type: 'options',
		default: 'CMS_INPUT_TEXT',
		displayOptions: { show: { resource: ['page'], operation: contentOperations } },
		description:
			'The type of the form editor, shown in parentheses next to the editor name in the list',
		options: [
			{ name: 'Checkbox', value: 'CMS_INPUT_CHECKBOX' },
			{ name: 'Combobox', value: 'CMS_INPUT_COMBOBOX' },
			{ name: 'Date', value: 'CMS_INPUT_DATE' },
			{ name: 'DOM (Rich Text)', value: 'CMS_INPUT_DOM' },
			{ name: 'DOM Table', value: 'CMS_INPUT_DOMTABLE' },
			{ name: 'FS Button', value: 'FS_BUTTON' },
			{ name: 'FS Catalog', value: 'FS_CATALOG' },
			{ name: 'FS Dataset', value: 'FS_DATASET' },
			{ name: 'FS Index', value: 'FS_INDEX' },
			{ name: 'FS Reference', value: 'FS_REFERENCE' },
			{ name: 'Imagemap', value: 'CMS_INPUT_IMAGEMAP' },
			{ name: 'Link', value: 'CMS_INPUT_LINK' },
			{ name: 'List', value: 'CMS_INPUT_LIST' },
			{ name: 'Number', value: 'CMS_INPUT_NUMBER' },
			{ name: 'Radiobutton', value: 'CMS_INPUT_RADIOBUTTON' },
			{ name: 'Text', value: 'CMS_INPUT_TEXT' },
			{ name: 'Textarea', value: 'CMS_INPUT_TEXTAREA' },
			{ name: 'Toggle', value: 'CMS_INPUT_TOGGLE' },
		],
	},
	resourceLocatorField(
		'revisionId',
		'Revision',
		'The revision to retrieve. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		'searchPageRevisions',
		{ resource: ['page'], operation: ['getRevision'] },
		'e.g. 42',
	),
	languageField({ resource: ['page'], operation: languageSuffixOperations }),
	releasedField({ resource: ['page'], operation: ['get'] }),
	stringField('uid', 'UID', 'The UID for the new page', {
		resource: ['page'],
		operation: ['create'],
	}),
	resourceLocatorField(
		'templateUid',
		'Page Template',
		'The page template to use. Choose from the list, or specify a UID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		'searchPageTemplates',
		{ resource: ['page'], operation: ['create'] },
	),
	{
		displayName: 'Action',
		name: 'action',
		type: 'options',
		required: true,
		default: 'copy',
		displayOptions: { show: { resource: ['page'], operation: ['executeActions'] } },
		description: 'The action to execute on the page',
		options: [
			{ name: 'Copy', value: 'copy', action: 'Copy a page' },
			{ name: 'Release', value: 'release', action: 'Release a page' },
		],
	},
	{
		displayName: 'Content',
		name: 'content',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['page'], operation: contentOperations } },
		description: 'The editor content value',
	},
	...renameBodyFields({ resource: ['page'], operation: renameOperations }),
];
