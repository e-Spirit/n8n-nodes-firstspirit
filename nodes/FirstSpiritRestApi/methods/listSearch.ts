import { ILoadOptionsFunctions, INodeListSearchItems, INodeListSearchResult } from 'n8n-workflow';
import { findRoute } from '../operations';
import { extractItems } from '../transport/pagination';
import { firstSpiritApiRequest } from '../transport/request';

interface Entry {
	id?: number | string;
	uid?: string;
	name?: string;
	displayName?: string;
	abbreviation?: string;
}

function currentProjectId(this: ILoadOptionsFunctions): string {
	try {
		const value = this.getCurrentNodeParameter('projectId', { extractValue: true });
		const id = value === undefined || value === null ? '' : String(value);
		return /^\d+$/.test(id) ? id : '';
	} catch {
		return '';
	}
}

function label(entry: Entry): string {
	return entry.displayName ?? entry.name ?? entry.uid ?? String(entry.id ?? '');
}

function matches(name: string, filter?: string): boolean {
	return filter === undefined || filter === '' || name.toLowerCase().includes(filter.toLowerCase());
}

function currentParam(this: ILoadOptionsFunctions, name: string): string {
	try {
		const raw = this.getCurrentNodeParameter(name, { extractValue: true });
		return raw === undefined || raw === null ? '' : String(raw);
	} catch {
		return '';
	}
}

interface FormEditorEntry {
	name: string;
	type?: string;
}

interface FormSummaryResponse {
	editors?: FormEditorEntry[];
}

async function searchFormEditors(
	this: ILoadOptionsFunctions,
	resource: string,
	operation: string,
	extraParams: Record<string, string>,
	filter?: string,
): Promise<INodeListSearchResult> {
	const route = findRoute(resource, operation);
	if (route === undefined) return { results: [] };

	const projectId = currentProjectId.call(this);
	if (projectId === '') return { results: [] };

	for (const v of Object.values(extraParams)) {
		if (v === '') return { results: [] };
	}

	const response = (await firstSpiritApiRequest.call(this, {
		route,
		params: { projectId, ...extraParams },
	})) as FormSummaryResponse;

	const results: INodeListSearchItems[] = (response.editors ?? [])
		.map((e) => ({
			name: e.type ? `${e.name} (${e.type})` : e.name,
			value: e.name,
		}))
		.filter((item) => item.value !== '' && matches(item.name, filter));

	return { results };
}

async function searchBy(
	this: ILoadOptionsFunctions,
	resource: string,
	operation: string,
	valueOf: (entry: Entry) => string,
	filter?: string,
): Promise<INodeListSearchResult> {
	const route = findRoute(resource, operation);
	if (route === undefined) return { results: [] };

	const projectId = currentProjectId.call(this);
	if (resource !== 'project' && projectId === '') return { results: [] };

	const response = await firstSpiritApiRequest.call(this, { route, params: { projectId } });
	const results: INodeListSearchItems[] = extractItems(response)
		.map((raw) => raw as Entry)
		.map((entry) => ({ name: label(entry), value: valueOf(entry) }))
		.filter((item) => item.value !== '' && matches(item.name, filter));

	return { results };
}

const byId = (entry: Entry) => String(entry.id ?? '');
const byGid = (entry: Entry) => String((entry as Record<string, unknown>).gid ?? '');
const byUid = (entry: Entry) => String(entry.uid ?? '');
const byName = (entry: Entry) => String(entry.name ?? '');
const byAbbreviation = (entry: Entry) => String(entry.abbreviation ?? '');

async function allowedSectionTemplateUids(
	this: ILoadOptionsFunctions,
	projectId: string,
	pageTemplateUid: string,
	bodyName: string,
): Promise<string[] | null> {
	const route = findRoute('pageTemplate', 'getBodies');
	if (route === undefined) return null;
	const response = await firstSpiritApiRequest.call(this, {
		route,
		params: { projectId, pageTemplateUid },
	});
	const bodies = extractItems(response) as Array<{
		name?: string;
		allowedTemplates?: string[] | null;
	}>;
	const body = bodies.find((b) => b.name === bodyName);
	if (body === undefined) return null;
	if (!body.allowedTemplates || body.allowedTemplates.length === 0) return null;
	return body.allowedTemplates;
}

async function filteredSectionTemplates(
	this: ILoadOptionsFunctions,
	projectId: string,
	allowedUids: string[] | null,
	filter?: string,
): Promise<INodeListSearchResult> {
	const route = findRoute('sectionTemplate', 'getAll');
	if (route === undefined) return { results: [] };
	const response = await firstSpiritApiRequest.call(this, { route, params: { projectId } });
	const uidSet = allowedUids !== null ? new Set(allowedUids) : null;
	const results: INodeListSearchItems[] = extractItems(response)
		.map((raw) => raw as Entry)
		.filter((entry) => uidSet === null || uidSet.has(String(entry.uid ?? '')))
		.map((entry) => ({ name: label(entry), value: byUid(entry) }))
		.filter((item) => item.value !== '' && matches(item.name, filter));
	return { results };
}

export const listSearch = {
	async searchProjects(this: ILoadOptionsFunctions, filter?: string) {
		return searchBy.call(this, 'project', 'getAll', byId, filter);
	},
	async searchLanguages(this: ILoadOptionsFunctions, filter?: string) {
		return searchBy.call(this, 'project', 'getLanguages', byAbbreviation, filter);
	},
	async searchTemplateSets(this: ILoadOptionsFunctions, filter?: string) {
		return searchBy.call(this, 'project', 'getTemplateSets', byUid, filter);
	},
	async searchBodies(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
		const route = findRoute('page', 'getBodies');
		if (route === undefined) return { results: [] };

		const projectId = currentProjectId.call(this);
		if (projectId === '') return { results: [] };

		let pageUid = '';
		try {
			const raw = this.getCurrentNodeParameter('pageUid', { extractValue: true });
			pageUid = raw === undefined || raw === null ? '' : String(raw);
		} catch {
			return { results: [] };
		}
		if (pageUid === '') return { results: [] };

		const response = await firstSpiritApiRequest.call(this, { route, params: { projectId, pageUid } });
		const results: INodeListSearchItems[] = extractItems(response)
			.map((raw) => raw as Entry)
			.map((entry) => ({ name: label(entry), value: byName(entry) }))
			.filter((item) => item.value !== '' && matches(item.name, filter));

		return { results };
	},
	async searchSections(
		this: ILoadOptionsFunctions,
		filter?: string,
	): Promise<INodeListSearchResult> {
		const route = findRoute('page', 'getBody');
		if (route === undefined) return { results: [] };

		const projectId = currentProjectId.call(this);
		if (projectId === '') return { results: [] };

		const pageUid = currentParam.call(this, 'pageUid');
		if (pageUid === '') return { results: [] };

		const bodyName = currentParam.call(this, 'bodyName');
		if (bodyName === '') return { results: [] };

		const response = (await firstSpiritApiRequest.call(this, {
			route,
			params: { projectId, pageUid, bodyName },
		})) as { sections?: Array<{ id: number; name: string }> };

		const results: INodeListSearchItems[] = (response.sections ?? [])
			.map((s) => ({ name: s.name, value: String(s.id) }))
			.filter((item) => item.value !== '' && matches(item.name, filter));

		return { results };
	},
	async searchPages(this: ILoadOptionsFunctions, filter?: string) {
		return searchBy.call(this, 'page', 'getAll', byUid, filter);
	},
	async searchPagesById(this: ILoadOptionsFunctions, filter?: string) {
		return searchBy.call(this, 'page', 'getAll', byId, filter);
	},
	async searchPageReferences(this: ILoadOptionsFunctions, filter?: string) {
		return searchBy.call(this, 'pageReference', 'getAll', byUid, filter);
	},
	async searchMedia(this: ILoadOptionsFunctions, filter?: string) {
		return searchBy.call(this, 'media', 'getAll', byUid, filter);
	},
	async searchDataSources(this: ILoadOptionsFunctions, filter?: string) {
		return searchBy.call(this, 'dataSource', 'getAll', byUid, filter);
	},
	async searchScripts(this: ILoadOptionsFunctions, filter?: string) {
		return searchBy.call(this, 'script', 'getAll', byName, filter);
	},
	async searchPageTemplates(this: ILoadOptionsFunctions, filter?: string) {
		return searchBy.call(this, 'pageTemplate', 'getAll', byUid, filter);
	},
	async searchSectionTemplates(this: ILoadOptionsFunctions, filter?: string) {
		return searchBy.call(this, 'sectionTemplate', 'getAll', byUid, filter);
	},
	async searchAllowedSectionTemplatesForPage(
		this: ILoadOptionsFunctions,
		filter?: string,
	): Promise<INodeListSearchResult> {
		const projectId = currentProjectId.call(this);
		if (projectId === '') return { results: [] };
		const pageUid = currentParam.call(this, 'pageUid');
		if (pageUid === '') return { results: [] };
		const bodyName = currentParam.call(this, 'bodyName');
		if (bodyName === '') return { results: [] };
		const pageRoute = findRoute('page', 'get');
		if (pageRoute === undefined) return { results: [] };
		const page = (await firstSpiritApiRequest.call(this, {
			route: pageRoute,
			params: { projectId, pageUid },
		})) as { templateUid?: string };
		const templateUid = page.templateUid ?? '';
		if (templateUid === '') return { results: [] };
		const allowedUids = await allowedSectionTemplateUids.call(
			this,
			projectId,
			templateUid,
			bodyName,
		);
		return filteredSectionTemplates.call(this, projectId, allowedUids, filter);
	},
	async searchAllowedSectionTemplatesForGCA(
		this: ILoadOptionsFunctions,
		filter?: string,
	): Promise<INodeListSearchResult> {
		const projectId = currentProjectId.call(this);
		if (projectId === '') return { results: [] };
		const gcaUid = currentParam.call(this, 'gcaUid');
		if (gcaUid === '') return { results: [] };
		const bodyName = currentParam.call(this, 'bodyName');
		if (bodyName === '') return { results: [] };
		const gcaRoute = findRoute('globalContent', 'get');
		if (gcaRoute === undefined) return { results: [] };
		const gca = (await firstSpiritApiRequest.call(this, {
			route: gcaRoute,
			params: { projectId, gcaUid },
		})) as { templateUid?: string };
		const templateUid = gca.templateUid ?? '';
		if (templateUid === '') return { results: [] };
		const allowedUids = await allowedSectionTemplateUids.call(
			this,
			projectId,
			templateUid,
			bodyName,
		);
		return filteredSectionTemplates.call(this, projectId, allowedUids, filter);
	},
	async searchLinkTemplates(this: ILoadOptionsFunctions, filter?: string) {
		return searchBy.call(this, 'linkTemplate', 'getAll', byUid, filter);
	},
	async searchFormatTemplates(this: ILoadOptionsFunctions, filter?: string) {
		return searchBy.call(this, 'formatTemplate', 'getAll', byUid, filter);
	},
	async searchResolutions(this: ILoadOptionsFunctions, filter?: string) {
		return searchBy.call(this, 'project', 'getResolutions', byUid, filter);
	},
	async searchSchemas(this: ILoadOptionsFunctions, filter?: string) {
		return searchBy.call(this, 'schema', 'getAll', byUid, filter);
	},
	async searchGCAs(this: ILoadOptionsFunctions, filter?: string) {
		return searchBy.call(this, 'globalContent', 'getAll', byUid, filter);
	},
	async searchPageTemplateBodies(
		this: ILoadOptionsFunctions,
		filter?: string,
	): Promise<INodeListSearchResult> {
		const route = findRoute('pageTemplate', 'getBodies');
		if (route === undefined) return { results: [] };
		const projectId = currentProjectId.call(this);
		if (projectId === '') return { results: [] };
		const pageTemplateUid = currentParam.call(this, 'pageTemplateUid');
		if (pageTemplateUid === '') return { results: [] };
		const response = await firstSpiritApiRequest.call(this, {
			route,
			params: { projectId, pageTemplateUid },
		});
		const results: INodeListSearchItems[] = extractItems(response)
			.map((raw) => raw as Entry)
			.map((entry) => ({ name: label(entry), value: byName(entry) }))
			.filter((item) => item.value !== '' && matches(item.name, filter));
		return { results };
	},
	async searchGCABodies(
		this: ILoadOptionsFunctions,
		filter?: string,
	): Promise<INodeListSearchResult> {
		const route = findRoute('globalContent', 'getBodies');
		if (route === undefined) return { results: [] };
		const projectId = currentProjectId.call(this);
		if (projectId === '') return { results: [] };
		const gcaUid = currentParam.call(this, 'gcaUid');
		if (gcaUid === '') return { results: [] };
		const response = await firstSpiritApiRequest.call(this, { route, params: { projectId, gcaUid } });
		const results: INodeListSearchItems[] = extractItems(response)
			.map((raw) => raw as Entry)
			.map((entry) => ({ name: label(entry), value: byName(entry) }))
			.filter((item) => item.value !== '' && matches(item.name, filter));
		return { results };
	},
	async searchGCASections(
		this: ILoadOptionsFunctions,
		filter?: string,
	): Promise<INodeListSearchResult> {
		const route = findRoute('globalContent', 'getBody');
		if (route === undefined) return { results: [] };
		const projectId = currentProjectId.call(this);
		if (projectId === '') return { results: [] };
		const gcaUid = currentParam.call(this, 'gcaUid');
		if (gcaUid === '') return { results: [] };
		const bodyName = currentParam.call(this, 'bodyName');
		if (bodyName === '') return { results: [] };
		const response = (await firstSpiritApiRequest.call(this, {
			route,
			params: { projectId, gcaUid, bodyName },
		})) as { sections?: Array<{ id: number; name: string }> };
		const results: INodeListSearchItems[] = (response.sections ?? [])
			.map((s) => ({ name: s.name, value: String(s.id) }))
			.filter((item) => item.value !== '' && matches(item.name, filter));
		return { results };
	},
	async searchProjectPropertiesFormEditors(this: ILoadOptionsFunctions, filter?: string) {
		return searchFormEditors.call(this, 'globalContent', 'getProjectProperties', {}, filter);
	},
	async searchGCASectionFormEditors(
		this: ILoadOptionsFunctions,
		filter?: string,
	): Promise<INodeListSearchResult> {
		const projectId = currentProjectId.call(this);
		if (projectId === '') return { results: [] };
		const gcaUid = currentParam.call(this, 'gcaUid');
		if (gcaUid === '') return { results: [] };
		const bodyName = currentParam.call(this, 'bodyName');
		if (bodyName === '') return { results: [] };
		const sectionId = currentParam.call(this, 'sectionId');
		if (sectionId === '') return { results: [] };
		const bodyRoute = findRoute('globalContent', 'getBody');
		if (bodyRoute === undefined) return { results: [] };
		const body = (await firstSpiritApiRequest.call(this, {
			route: bodyRoute,
			params: { projectId, gcaUid, bodyName },
		})) as {
			sections?: Array<{ id: number; template?: { uid?: string } }>;
		};
		const section = (body.sections ?? []).find((s) => String(s.id) === sectionId);
		const sectionTemplateUid = section?.template?.uid ?? '';
		if (sectionTemplateUid === '') return { results: [] };
		return searchFormEditors.call(
			this,
			'sectionTemplate',
			'getGomForm',
			{ sectionTemplateUid },
			filter,
		);
	},
	async searchGCAFormEditors(
		this: ILoadOptionsFunctions,
		filter?: string,
	): Promise<INodeListSearchResult> {
		const projectId = currentProjectId.call(this);
		if (projectId === '') return { results: [] };
		const gcaUid = currentParam.call(this, 'gcaUid');
		if (gcaUid === '') return { results: [] };
		const gcaRoute = findRoute('globalContent', 'get');
		if (gcaRoute === undefined) return { results: [] };
		const gca = (await firstSpiritApiRequest.call(this, {
			route: gcaRoute,
			params: { projectId, gcaUid },
		})) as { templateUid?: string };
		const pageTemplateUid = gca.templateUid ?? '';
		if (pageTemplateUid === '') return { results: [] };
		return searchFormEditors.call(this, 'pageTemplate', 'getGomForm', { pageTemplateUid }, filter);
	},
	async searchPageFormEditors(this: ILoadOptionsFunctions, filter?: string) {
		const pageUid = currentParam.call(this, 'pageUid');
		return searchFormEditors.call(this, 'page', 'getForm', { pageUid }, filter);
	},
	async searchPageMetadataEditors(this: ILoadOptionsFunctions, filter?: string) {
		const pageUid = currentParam.call(this, 'pageUid');
		return searchFormEditors.call(this, 'page', 'getMetadata', { pageUid }, filter);
	},
	async searchSectionFormEditors(this: ILoadOptionsFunctions, filter?: string) {
		const pageUid = currentParam.call(this, 'pageUid');
		const bodyName = currentParam.call(this, 'bodyName');
		const sectionId = currentParam.call(this, 'sectionId');
		return searchFormEditors.call(
			this,
			'section',
			'getForm',
			{ pageUid, bodyName, sectionId },
			filter,
		);
	},
	async searchDatasetFormEditors(this: ILoadOptionsFunctions, filter?: string) {
		const datasource = currentParam.call(this, 'datasource');
		const datasetGid = currentParam.call(this, 'datasetGid');
		return searchFormEditors.call(this, 'dataset', 'getForm', { datasource, datasetGid }, filter);
	},
	async searchModules(
		this: ILoadOptionsFunctions,
		filter?: string,
	): Promise<INodeListSearchResult> {
		const route = findRoute('module', 'getAll');
		if (route === undefined) return { results: [] };

		const response = await firstSpiritApiRequest.call(this, { route, params: {} });
		const results: INodeListSearchItems[] = extractItems(response)
			.map((raw) => raw as Entry)
			.map((entry) => ({ name: label(entry), value: byName(entry) }))
			.filter((item) => item.value !== '' && matches(item.name, filter));

		return { results };
	},
	async searchDocumentGroups(this: ILoadOptionsFunctions, filter?: string) {
		return searchBy.call(this, 'documentGroup', 'getAll', byUid, filter);
	},
	async searchDatasets(
		this: ILoadOptionsFunctions,
		filter?: string,
	): Promise<INodeListSearchResult> {
		const route = findRoute('dataset', 'getAll');
		if (route === undefined) return { results: [] };
		const projectId = currentProjectId.call(this);
		if (projectId === '') return { results: [] };
		const datasource = currentParam.call(this, 'datasource');
		if (datasource === '') return { results: [] };
		const response = await firstSpiritApiRequest.call(this, {
			route,
			params: { projectId, datasource },
		});
		const results: INodeListSearchItems[] = extractItems(response)
			.map((raw) => raw as Entry)
			.map((entry) => ({ name: label(entry), value: byGid(entry) }))
			.filter((item) => item.value !== '' && matches(item.name, filter));
		return { results };
	},
	async searchPageRevisions(
		this: ILoadOptionsFunctions,
		filter?: string,
	): Promise<INodeListSearchResult> {
		const route = findRoute('page', 'getRevisions');
		if (route === undefined) return { results: [] };
		const projectId = currentProjectId.call(this);
		if (projectId === '') return { results: [] };
		const pageUid = currentParam.call(this, 'pageUid');
		if (pageUid === '') return { results: [] };
		const response = await firstSpiritApiRequest.call(this, { route, params: { projectId, pageUid } });
		const results: INodeListSearchItems[] = extractItems(response)
			.map((raw) => raw as Entry)
			.map((entry) => ({ name: label(entry), value: byId(entry) }))
			.filter((item) => item.value !== '' && matches(item.name, filter));
		return { results };
	},
	async searchPageReferenceRevisions(
		this: ILoadOptionsFunctions,
		filter?: string,
	): Promise<INodeListSearchResult> {
		const route = findRoute('pageReference', 'getRevisions');
		if (route === undefined) return { results: [] };
		const projectId = currentProjectId.call(this);
		if (projectId === '') return { results: [] };
		const pageReferenceUid = currentParam.call(this, 'pageReferenceUid');
		if (pageReferenceUid === '') return { results: [] };
		const response = await firstSpiritApiRequest.call(this, {
			route,
			params: { projectId, pageReferenceUid },
		});
		const results: INodeListSearchItems[] = extractItems(response)
			.map((raw) => raw as Entry)
			.map((entry) => ({ name: label(entry), value: byId(entry) }))
			.filter((item) => item.value !== '' && matches(item.name, filter));
		return { results };
	},
	async searchMediaRevisions(
		this: ILoadOptionsFunctions,
		filter?: string,
	): Promise<INodeListSearchResult> {
		const route = findRoute('media', 'getRevisions');
		if (route === undefined) return { results: [] };
		const projectId = currentProjectId.call(this);
		if (projectId === '') return { results: [] };
		const mediumUid = currentParam.call(this, 'mediumUid');
		if (mediumUid === '') return { results: [] };
		const response = await firstSpiritApiRequest.call(this, {
			route,
			params: { projectId, mediumUid },
		});
		const results: INodeListSearchItems[] = extractItems(response)
			.map((raw) => raw as Entry)
			.map((entry) => ({ name: label(entry), value: byId(entry) }))
			.filter((item) => item.value !== '' && matches(item.name, filter));
		return { results };
	},
	async searchDatasetRevisions(
		this: ILoadOptionsFunctions,
		filter?: string,
	): Promise<INodeListSearchResult> {
		const route = findRoute('dataset', 'getRevisions');
		if (route === undefined) return { results: [] };
		const projectId = currentProjectId.call(this);
		if (projectId === '') return { results: [] };
		const datasource = currentParam.call(this, 'datasource');
		const datasetGid = currentParam.call(this, 'datasetGid');
		if (datasource === '' || datasetGid === '') return { results: [] };
		const response = await firstSpiritApiRequest.call(this, {
			route,
			params: { projectId, datasource, datasetGid },
		});
		const results: INodeListSearchItems[] = extractItems(response)
			.map((raw) => raw as Entry)
			.map((entry) => ({ name: label(entry), value: byId(entry) }))
			.filter((item) => item.value !== '' && matches(item.name, filter));
		return { results };
	},
};
