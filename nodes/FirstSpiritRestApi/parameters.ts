import { IExecuteFunctions } from 'n8n-workflow';
import { OperationRoute } from './types';

export function placeholderNames(path: string): string[] {
	return [...path.matchAll(/\{([^}]+)\}/g)].map((match) => match[1]);
}

export async function collectParams(
	this: IExecuteFunctions,
	route: OperationRoute,
	itemIndex: number,
): Promise<Record<string, unknown>> {
	const params: Record<string, unknown> = {};

	for (const name of placeholderNames(route.path)) {
		// The folder wildcard is addressed by a readable field name instead of '**'.
		const parameterName = name === '**' ? 'folderPath' : name;
		const raw = this.getNodeParameter(parameterName, itemIndex, undefined, {
			extractValue: true,
		}) as unknown;
		params[name] = raw;
	}

	if (route.languageSuffix) {
		params.language = this.getNodeParameter('language', itemIndex, undefined, {
			extractValue: true,
		}) as unknown;
	}

	for (const name of route.query ?? []) {
		if (name === 'page' || name === 'size') continue; // supplied by the pagination helper
		params[name] = this.getNodeParameter(name, itemIndex, undefined, {
			extractValue: true,
		}) as unknown;
	}

	return params;
}
