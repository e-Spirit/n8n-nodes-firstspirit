import { INodeProperties } from 'n8n-workflow';
import { projectField } from './shared';
import { dataSourceDescription } from './dataSource';
import { datasetDescription } from './dataset';
import { documentGroupDescription } from './documentGroup';
import { folderDescription } from './folder';
import { formatTemplateDescription } from './formatTemplate';
import { globalContentDescription } from './globalContent';
import { linkTemplateDescription } from './linkTemplate';
import { mediaDescription } from './media';
import { moduleDescription } from './module';
import { pageDescription } from './page';
import { pageReferenceDescription } from './pageReference';
import { pageTemplateDescription } from './pageTemplate';
import { projectDescription } from './project';
import { schemaDescription } from './schema';
import { scriptDescription } from './script';
import { searchDescription } from './search';
import { sectionDescription } from './section';
import { sectionTemplateDescription } from './sectionTemplate';

/**
 * Resources whose paths never contain {projectId}. The project resource is listed here because
 * its own operations either take no project at all or address it through {id}; project.ts
 * declares its own project field for the sub-resource operations.
 */
const PROJECTLESS_RESOURCES = ['module', 'project'];

// NOTE: resourceOptions and the inline `options` array below are intentionally duplicated.
// The ESLint rule `node-param-resource-with-plural-option` crashes with a TypeError when
// `options` is a variable reference rather than an inline array literal, so the literal must
// stay inline. `resourceOptions` is exported for the structure test's `it.each(resources)`.
// The test "resource dropdown in nodeProperties lists exactly the resources in resourceOptions"
// in tests/descriptions-structure.test.ts guards against the two lists drifting.
// When adding a resource in Tasks 9-17: update BOTH arrays.
export const resourceOptions = [
	{ name: 'Data Source', value: 'dataSource' },
	{ name: 'Dataset', value: 'dataset' },
	{ name: 'Document Group', value: 'documentGroup' },
	{ name: 'Folder', value: 'folder' },
	{ name: 'Format Template', value: 'formatTemplate' },
	{ name: 'Global Content', value: 'globalContent' },
	{ name: 'Link Template', value: 'linkTemplate' },
	{ name: 'Media', value: 'media' },
	{ name: 'Module', value: 'module' },
	{ name: 'Page', value: 'page' },
	{ name: 'Page Reference', value: 'pageReference' },
	{ name: 'Page Template', value: 'pageTemplate' },
	{ name: 'Project', value: 'project' },
	{ name: 'Schema', value: 'schema' },
	{ name: 'Script', value: 'script' },
	{ name: 'Search', value: 'search' },
	{ name: 'Section', value: 'section' },
	{ name: 'Section Template', value: 'sectionTemplate' },
];

export const nodeProperties: INodeProperties[] = [
	{
		displayName: 'Resource',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		default: 'project',
		// Keep in sync with resourceOptions above — see comment there.
		options: [
			{ name: 'Data Source', value: 'dataSource' },
			{ name: 'Dataset', value: 'dataset' },
			{ name: 'Document Group', value: 'documentGroup' },
			{ name: 'Folder', value: 'folder' },
			{ name: 'Format Template', value: 'formatTemplate' },
			{ name: 'Global Content', value: 'globalContent' },
			{ name: 'Link Template', value: 'linkTemplate' },
			{ name: 'Media', value: 'media' },
			{ name: 'Module', value: 'module' },
			{ name: 'Page', value: 'page' },
			{ name: 'Page Reference', value: 'pageReference' },
			{ name: 'Page Template', value: 'pageTemplate' },
			{ name: 'Project', value: 'project' },
			{ name: 'Schema', value: 'schema' },
			{ name: 'Script', value: 'script' },
			{ name: 'Search', value: 'search' },
			{ name: 'Section', value: 'section' },
			{ name: 'Section Template', value: 'sectionTemplate' },
		],
	},
	{
		...projectField,
		displayOptions: { hide: { resource: PROJECTLESS_RESOURCES } },
	},
	...dataSourceDescription,
	...datasetDescription,
	...documentGroupDescription,
	...folderDescription,
	...formatTemplateDescription,
	...globalContentDescription,
	...linkTemplateDescription,
	...mediaDescription,
	...moduleDescription,
	...pageDescription,
	...pageReferenceDescription,
	...pageTemplateDescription,
	...projectDescription,
	...schemaDescription,
	...scriptDescription,
	...searchDescription,
	...sectionDescription,
	...sectionTemplateDescription,
	{
		displayName: 'Split Lists Into Items',
		name: 'splitItems',
		type: 'boolean',
		default: true,
		description: 'Whether to output each element of a list response as its own item',
	},
];
