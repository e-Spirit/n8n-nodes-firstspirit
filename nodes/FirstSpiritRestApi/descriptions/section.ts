import { INodeProperties } from 'n8n-workflow';
import { languageField, renameBodyFields, resourceLocatorField, stringField } from './shared';

const show = { resource: ['section'] };

const allOperations = ['add', 'delete', 'getForm', 'getFormEditor', 'rename', 'updateFormEditor'];

const existingSectionOperations = [
	'delete',
	'getForm',
	'getFormEditor',
	'rename',
	'updateFormEditor',
];

const editorNameOperations = ['getFormEditor', 'updateFormEditor'];

const languageSuffixOperations = ['getFormEditor', 'updateFormEditor'];

const renameOperations = ['rename'];

export const sectionDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show },
		default: 'getForm',
		options: [
			{ name: 'Add', value: 'add', action: 'Add a section to a body' },
			{ name: 'Delete', value: 'delete', action: 'Delete a section from a body' },
			{ name: 'Get Form', value: 'getForm', action: 'Get the form of a section' },
			{
				name: 'Get Form Editor',
				value: 'getFormEditor',
				action: 'Get a form editor of a section',
			},
			{ name: 'Rename', value: 'rename', action: 'Rename a section' },
			{
				name: 'Update Form Editor',
				value: 'updateFormEditor',
				action: 'Update a form editor of a section',
			},
		],
	},
	resourceLocatorField('pageUid', 'Page', 'The UID of the FirstSpirit page', 'searchPages', {
		resource: ['section'],
		operation: allOperations,
	}),
	resourceLocatorField(
		'bodyName',
		'Body',
		'The page body to address. Choose from the list, or specify a name using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		'searchBodies',
		{ resource: ['section'], operation: allOperations },
		'e.g. content',
	),
	resourceLocatorField(
		'sectionId',
		'Section',
		'The section to address. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		'searchSections',
		{ resource: ['section'], operation: existingSectionOperations },
		'e.g. 42',
	),
	stringField('sectionName', 'Section Name', 'The display name for the new section', {
		resource: ['section'],
		operation: ['add'],
	}),
	{
		displayName: 'Index',
		name: 'index',
		type: 'number',
		default: 0,
		displayOptions: { show: { resource: ['section'], operation: ['add'] } },
		description: 'Position (0-based) at which to insert the section in the body',
	},
	resourceLocatorField(
		'editorName',
		'Form Editor',
		'The form editor to address. Choose from the list, or specify a name using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		'searchSectionFormEditors',
		{ resource: ['section'], operation: editorNameOperations },
		'e.g. pt_headline',
	),
	{
		displayName: 'Editor Type',
		name: 'type',
		type: 'options',
		default: 'CMS_INPUT_TEXT',
		displayOptions: { show: { resource: ['section'], operation: ['updateFormEditor'] } },
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
	languageField({ resource: ['section'], operation: languageSuffixOperations }),
	resourceLocatorField(
		'templateUid',
		'Section Template',
		'The section template to use. Choose from the list, or specify a UID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		'searchAllowedSectionTemplatesForPage',
		{ resource: ['section'], operation: ['add'] },
	),
	{
		displayName: 'Content',
		name: 'content',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['section'], operation: ['updateFormEditor'] } },
		description: 'The editor content value',
	},
	...renameBodyFields({ resource: ['section'], operation: renameOperations }),
];
