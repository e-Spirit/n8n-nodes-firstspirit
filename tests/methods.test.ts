import { INodeProperties } from 'n8n-workflow';
import { listSearch } from '../nodes/FirstSpiritRestApi/methods/listSearch';
import { loadOptions } from '../nodes/FirstSpiritRestApi/methods/loadOptions';
import { methods } from '../nodes/FirstSpiritRestApi/methods';
import { nodeProperties } from '../nodes/FirstSpiritRestApi/descriptions';

function contextReturning(response: unknown, projectId: unknown = '1') {
	const httpRequest = jest.fn().mockResolvedValue(response);
	return {
		httpRequest,
		context: {
			getCredentials: jest.fn().mockResolvedValue({
				username: 'u',
				password: 'p',
				baseUrl: 'https://host/rest',
			}),
			getNode: jest.fn().mockReturnValue({ name: 'FirstSpirit REST API' }),
			getNodeParameter: jest.fn().mockReturnValue(projectId),
			getCurrentNodeParameter: jest.fn().mockReturnValue(projectId),
			helpers: {
				httpRequestWithAuthentication: (_credential: string, options: unknown) =>
					httpRequest(options),
			},
		},
	};
}

describe('listSearch.searchProjects', () => {
	it('maps projects to name and value', async () => {
		const { context } = contextReturning([
			{ id: 1, name: 'Corporate Site' },
			{ id: 2, name: 'Campaign' },
		]);

		const result = await listSearch.searchProjects.call(context as never);

		expect(result.results).toEqual([
			{ name: 'Corporate Site', value: '1' },
			{ name: 'Campaign', value: '2' },
		]);
	});

	it('filters case insensitively', async () => {
		const { context } = contextReturning([
			{ id: 1, name: 'Corporate Site' },
			{ id: 2, name: 'Campaign' },
		]);

		const result = await listSearch.searchProjects.call(context as never, 'camp');

		expect(result.results).toEqual([{ name: 'Campaign', value: '2' }]);
	});

	it('returns an empty result list for an empty response', async () => {
		const { context } = contextReturning([]);

		const result = await listSearch.searchProjects.call(context as never);

		expect(result.results).toEqual([]);
	});

	it('falls back to the uid when an entry has no name', async () => {
		const { context } = contextReturning([{ id: 7, uid: 'internal_project' }]);

		const result = await listSearch.searchProjects.call(context as never);

		expect(result.results).toEqual([{ name: 'internal_project', value: '7' }]);
	});
});

describe('listSearch.searchPages', () => {
	it('uses the uid as the value', async () => {
		const { context } = contextReturning([{ uid: 'homepage', displayName: 'Homepage' }]);

		const result = await listSearch.searchPages.call(context as never);

		expect(result.results).toEqual([{ name: 'Homepage', value: 'homepage' }]);
	});
});

describe('loadOptions.getLanguages', () => {
	it('maps languages to options', async () => {
		const { context } = contextReturning([
			{ abbreviation: 'DE', name: 'Deutsch' },
			{ abbreviation: 'EN', name: 'English' },
		]);

		const result = await loadOptions.getLanguages.call(context as never);

		expect(result).toEqual([
			{ name: 'Deutsch', value: 'DE' },
			{ name: 'English', value: 'EN' },
		]);
	});

	it('returns an empty list when no project is selected yet', async () => {
		const { context } = contextReturning([], '');

		const result = await loadOptions.getLanguages.call(context as never);

		expect(result).toEqual([]);
	});
});

describe('loadOptions.getTemplateSets', () => {
	it('uses the uid as the value, because TemplateSetDTO carries no abbreviation', () => {
		// The OpenAPI schema for TemplateSetDTO is { uid, extension, conversionTable,
		// active, templateInspectionEnabled }. Reading an "abbreviation" off it yields
		// undefined, every option is filtered out for an empty value, and the dropdown
		// stays permanently empty -- which lint, tsc and the coverage gate all pass.
		return (async () => {
			const { context } = contextReturning([{ uid: 'html', extension: 'html' }]);

			const result = await loadOptions.getTemplateSets.call(context as never);

			expect(result).toEqual([{ name: 'html', value: 'html' }]);
		})();
	});
});

describe('loadOptions.getResolutions', () => {
	it('uses the uid as the value', async () => {
		const { context } = contextReturning([{ uid: 'ORIGINAL', width: 0, height: 0 }]);

		const result = await loadOptions.getResolutions.call(context as never);

		expect(result).toEqual([{ name: 'ORIGINAL', value: 'ORIGINAL' }]);
	});
});

// Guard: every method name referenced in nodeProperties must exist on methods

function collectSearchListMethods(properties: INodeProperties[]): string[] {
	const names: string[] = [];
	for (const prop of properties) {
		if (prop.type === 'resourceLocator' && Array.isArray(prop.modes)) {
			for (const mode of prop.modes) {
				if (
					mode.type === 'list' &&
					typeof mode.typeOptions === 'object' &&
					mode.typeOptions !== null
				) {
					const method = (mode.typeOptions as Record<string, unknown>).searchListMethod;
					if (typeof method === 'string') names.push(method);
				}
			}
		}
	}
	return [...new Set(names)];
}

function collectLoadOptionsMethods(properties: INodeProperties[]): string[] {
	const names: string[] = [];
	for (const prop of properties) {
		const typeOptions = prop.typeOptions as Record<string, unknown> | undefined;
		if (typeOptions?.loadOptionsMethod !== undefined) {
			names.push(String(typeOptions.loadOptionsMethod));
		}
	}
	return [...new Set(names)];
}

describe('methods guard', () => {
	it('every searchListMethod referenced in nodeProperties exists on methods.listSearch', () => {
		const referenced = collectSearchListMethods(nodeProperties);
		const missing = referenced.filter(
			(name) => !(name in (methods.listSearch as Record<string, unknown>)),
		);
		expect(missing).toEqual([]);
	});

	it('every loadOptionsMethod referenced in nodeProperties exists on methods.loadOptions', () => {
		const referenced = collectLoadOptionsMethods(nodeProperties);
		const missing = referenced.filter(
			(name) => !(name in (methods.loadOptions as Record<string, unknown>)),
		);
		expect(missing).toEqual([]);
	});
});
