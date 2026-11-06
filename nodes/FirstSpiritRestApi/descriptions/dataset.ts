import { INodeProperties } from 'n8n-workflow';
import { languageField, resourceLocatorField } from './shared';

const show = { resource: ['dataset'] };

const datasourceOperations = [
	'create',
	'delete',
	'get',
	'getAll',
	'getEntity',
	'getForm',
	'getFormEditor',
	'getRevision',
	'getRevisions',
	'updateFormEditor',
];

const datasetGidOperations = [
	'delete',
	'get',
	'getEntity',
	'getForm',
	'getFormEditor',
	'getRevision',
	'getRevisions',
	'updateFormEditor',
];

const editorNameOperations = ['getFormEditor', 'updateFormEditor'];

const languageSuffixOperations = ['getFormEditor', 'updateFormEditor'];

export const datasetDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show },
		default: 'getAll',
		options: [
			{ name: 'Create', value: 'create', action: 'Create a new dataset' },
			{ name: 'Delete', value: 'delete', action: 'Delete a dataset' },
			{ name: 'Get', value: 'get', action: 'Get dataset by GID' },
			{ name: 'Get Entity', value: 'getEntity', action: 'Get dataset entity' },
			{ name: 'Get Form', value: 'getForm', action: 'Get dataset form' },
			{ name: 'Get Form Editor', value: 'getFormEditor', action: 'Get a dataset form editor' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many datasets' },
			{ name: 'Get Revision', value: 'getRevision', action: 'Get single revision' },
			{ name: 'Get Revisions', value: 'getRevisions', action: 'Get all revisions' },
			{
				name: 'Update Form Editor',
				value: 'updateFormEditor',
				action: 'Update a dataset form editor',
			},
		],
	},
	resourceLocatorField(
		'datasource',
		'Data Source',
		'The data source to address',
		'searchDataSources',
		{ resource: ['dataset'], operation: datasourceOperations },
	),
	resourceLocatorField(
		'datasetGid',
		'Dataset',
		'The dataset to address. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		'searchDatasets',
		{ resource: ['dataset'], operation: datasetGidOperations },
		'e.g. 42',
	),
	resourceLocatorField(
		'editorName',
		'Form Editor',
		'The form editor to address. Choose from the list, or specify a name using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		'searchDatasetFormEditors',
		{ resource: ['dataset'], operation: editorNameOperations },
		'e.g. pt_headline',
	),
	{
		displayName: 'Editor Type',
		name: 'type',
		type: 'options',
		default: 'CMS_INPUT_TEXT',
		displayOptions: { show: { resource: ['dataset'], operation: ['updateFormEditor'] } },
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
		'searchDatasetRevisions',
		{ resource: ['dataset'], operation: ['getRevision'] },
		'e.g. 42',
	),
	languageField({ resource: ['dataset'], operation: languageSuffixOperations }),
	{
		displayName: 'Language Name or ID',
		name: 'lang',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		displayOptions: { show: { resource: ['dataset'], operation: ['get'] } },
		description:
			'The language to filter by. Choose from the list, or specify an abbreviation using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				typeOptions: { searchListMethod: 'searchLanguages', searchable: true },
			},
			{
				displayName: 'By ID',
				name: 'id',
				type: 'string',
				placeholder: 'e.g. DE',
			},
		],
	},
	{
		displayName: 'Content',
		name: 'content',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['dataset'], operation: ['updateFormEditor'] } },
		description: 'The editor content value',
	},
];
