import { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { findRoute } from '../operations';
import { extractItems } from '../transport/pagination';
import { firstSpiritApiRequest } from '../transport/request';

interface Entry {
	abbreviation?: string;
	uid?: string;
	name?: string;
	displayName?: string;
}

async function optionsFrom(
	this: ILoadOptionsFunctions,
	resource: string,
	operation: string,
	valueOf: (entry: Entry) => string,
): Promise<INodePropertyOptions[]> {
	const route = findRoute(resource, operation);
	if (route === undefined) return [];

	let projectId = '';
	try {
		const raw = this.getCurrentNodeParameter('projectId', { extractValue: true });
		projectId = raw === undefined || raw === null ? '' : String(raw);
	} catch {
		return [];
	}
	if (!/^\d+$/.test(projectId)) return [];

	const response = await firstSpiritApiRequest.call(this, { route, params: { projectId } });
	return extractItems(response)
		.map((item) => item as Entry)
		.map((entry) => ({
			name: entry.name ?? entry.displayName ?? valueOf(entry),
			value: valueOf(entry),
		}))
		.filter((option) => option.value !== '');
}

const byAbbreviation = (entry: Entry) => String(entry.abbreviation ?? '');
const byUid = (entry: Entry) => String(entry.uid ?? '');

export const loadOptions = {
	async getLanguages(this: ILoadOptionsFunctions) {
		return optionsFrom.call(this, 'project', 'getLanguages', byAbbreviation);
	},
	async getTemplateSets(this: ILoadOptionsFunctions) {
		return optionsFrom.call(this, 'project', 'getTemplateSets', byUid);
	},
	async getResolutions(this: ILoadOptionsFunctions) {
		return optionsFrom.call(this, 'project', 'getResolutions', byUid);
	},
	async getSectionTemplates(this: ILoadOptionsFunctions) {
		return optionsFrom.call(this, 'sectionTemplate', 'getAll', byUid);
	},
};
