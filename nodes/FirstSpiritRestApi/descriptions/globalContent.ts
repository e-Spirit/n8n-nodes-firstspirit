import { INodeProperties } from 'n8n-workflow';
import { languageField, resourceLocatorField, stringField } from './shared';

const show = { resource: ['globalContent'] };

const gcaUidOperations = [
	'delete',
	'get',
	'getBodies',
	'getBody',
	'addSection',
	'deleteSection',
	'getFormEditor',
	'updateFormEditor',
	'getSectionFormEditor',
	'updateSectionFormEditor',
];

const bodyNameOperations = [
	'getBody',
	'addSection',
	'deleteSection',
	'getSectionFormEditor',
	'updateSectionFormEditor',
];

const sectionIdOperations = ['deleteSection', 'getSectionFormEditor', 'updateSectionFormEditor'];

const gcaFormEditorOperations = ['getFormEditor', 'updateFormEditor'];

const gcaSectionFormEditorOperations = ['getSectionFormEditor', 'updateSectionFormEditor'];

const projectPropertiesFormEditorOperations = ['updateProjectPropertiesFormEditor'];

const languageSuffixOperations = [
	'getFormEditor',
	'updateFormEditor',
	'getSectionFormEditor',
	'updateSectionFormEditor',
];

const contentOperations = [
	'updateFormEditor',
	'updateSectionFormEditor',
	'updateProjectPropertiesFormEditor',
];

const editorTypeOptions = [
	{ name: 'Checkbox', value: 'CMS_INPUT_CHECKBOX' },
	{ name: 'Combobox', value: 'CMS_INPUT_COMBOBOX' },
	{ name: 'Date', value: 'CMS_INPUT_DATE' },
	{ name: 'DOM (Rich Text)', value: 'CMS_INPUT_DOM' },
	{ name: 'DOM Table', value: 'CMS_INPUT_DOMTABLE' },
	{ name: 'Imagemap', value: 'CMS_INPUT_IMAGEMAP' },
	{ name: 'Link', value: 'CMS_INPUT_LINK' },
	{ name: 'List', value: 'CMS_INPUT_LIST' },
	{ name: 'Number', value: 'CMS_INPUT_NUMBER' },
	{ name: 'Radiobutton', value: 'CMS_INPUT_RADIOBUTTON' },
	{ name: 'Text', value: 'CMS_INPUT_TEXT' },
	{ name: 'Textarea', value: 'CMS_INPUT_TEXTAREA' },
	{ name: 'Toggle', value: 'CMS_INPUT_TOGGLE' },
	{ name: 'FS Button', value: 'FS_BUTTON' },
	{ name: 'FS Catalog', value: 'FS_CATALOG' },
	{ name: 'FS Dataset', value: 'FS_DATASET' },
	{ name: 'FS Index', value: 'FS_INDEX' },
	{ name: 'FS Reference', value: 'FS_REFERENCE' },
];

export const globalContentDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show },
		default: 'getAll',
		options: [
			{ name: 'Add Section', value: 'addSection', action: 'Add a section to a GCA body' },
			{ name: 'Create', value: 'create', action: 'Create a global content area page' },
			{ name: 'Delete', value: 'delete', action: 'Delete a global content area page' },
			{
				name: 'Delete Section',
				value: 'deleteSection',
				action: 'Delete a section from a GCA body',
			},
			{ name: 'Get', value: 'get', action: 'Get a global content area page' },
			{ name: 'Get Bodies', value: 'getBodies', action: 'Get all bodies of a GCA page' },
			{ name: 'Get Body', value: 'getBody', action: 'Get a body of a GCA page' },
			{
				name: 'Get Form Editor',
				value: 'getFormEditor',
				action: 'Get a form editor of a GCA page',
			},
			{ name: 'Get Many', value: 'getAll', action: 'Get many global content area pages' },
			{
				name: 'Get Project Properties',
				value: 'getProjectProperties',
				action: 'Get project properties',
			},
			{
				name: 'Get Section Form Editor',
				value: 'getSectionFormEditor',
				action: 'Get a form editor of a GCA section',
			},
			{
				name: 'Update Form Editor',
				value: 'updateFormEditor',
				action: 'Update a form editor of a GCA page',
			},
			{
				name: 'Update Project Properties Form Editor',
				value: 'updateProjectPropertiesFormEditor',
				action: 'Update a form editor of the project properties',
			},
			{
				name: 'Update Section Form Editor',
				value: 'updateSectionFormEditor',
				action: 'Update a form editor of a GCA section',
			},
		],
	},
	resourceLocatorField(
		'gcaUid',
		'GCA Page',
		'The Global Content Area page to address. Choose from the list, or specify a UID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		'searchGCAs',
		{ resource: ['globalContent'], operation: gcaUidOperations },
	),
	resourceLocatorField(
		'bodyName',
		'Body',
		'The body to address. Choose from the list, or specify a name using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		'searchGCABodies',
		{ resource: ['globalContent'], operation: bodyNameOperations },
		'e.g. content',
	),
	resourceLocatorField(
		'sectionId',
		'Section',
		'The section to address. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		'searchGCASections',
		{ resource: ['globalContent'], operation: sectionIdOperations },
		'e.g. 42',
	),
	resourceLocatorField(
		'editorName',
		'Form Editor',
		'The form editor to address. Choose from the list, or specify a name using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		'searchGCAFormEditors',
		{ resource: ['globalContent'], operation: gcaFormEditorOperations },
		'e.g. pt_headline',
	),
	resourceLocatorField(
		'editorName',
		'Form Editor',
		'The form editor to address. Choose from the list, or specify a name using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		'searchGCASectionFormEditors',
		{ resource: ['globalContent'], operation: gcaSectionFormEditorOperations },
		'e.g. st_text',
	),
	resourceLocatorField(
		'editorName',
		'Form Editor',
		'The form editor to address. Choose from the list, or specify a name using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		'searchProjectPropertiesFormEditors',
		{ resource: ['globalContent'], operation: projectPropertiesFormEditorOperations },
		'e.g. pt_headline',
	),
	{
		displayName: 'Editor Type',
		name: 'type',
		type: 'options',
		default: 'CMS_INPUT_TEXT',
		displayOptions: { show: { resource: ['globalContent'], operation: contentOperations } },
		description: 'The type of the form editor',
		options: editorTypeOptions,
	},
	languageField({ resource: ['globalContent'], operation: languageSuffixOperations }),
	{
		displayName: 'Language Name or ID',
		name: 'lang',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		displayOptions: {
			show: { resource: ['globalContent'], operation: ['getProjectProperties'] },
		},
		description:
			'The language to use for the request. Choose from the list, or specify an abbreviation using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
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
	stringField('uid', 'UID', 'The UID for the new GCA page', {
		resource: ['globalContent'],
		operation: ['create'],
	}),
	resourceLocatorField(
		'templateUid',
		'Page Template',
		'The page template to use. Choose from the list, or specify a UID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		'searchPageTemplates',
		{ resource: ['globalContent'], operation: ['create'] },
	),
	stringField('sectionName', 'Section Name', 'The display name for the new section', {
		resource: ['globalContent'],
		operation: ['addSection'],
	}),
	{
		displayName: 'Index',
		name: 'index',
		type: 'number',
		default: 0,
		displayOptions: { show: { resource: ['globalContent'], operation: ['addSection'] } },
		description: 'Position (0-based) at which to insert the section; omit or use 0 to append',
	},
	resourceLocatorField(
		'templateUid',
		'Section Template',
		'The section template to use. Choose from the list, or specify a UID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		'searchAllowedSectionTemplatesForGCA',
		{ resource: ['globalContent'], operation: ['addSection'] },
	),
	{
		displayName: 'Content',
		name: 'content',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['globalContent'], operation: contentOperations } },
		description: 'The editor content value',
	},
];
