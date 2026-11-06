import { INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { nodeProperties, resourceOptions } from '../nodes/FirstSpiritRestApi/descriptions';
import { operationRoutes } from '../nodes/FirstSpiritRestApi/operations';
import { placeholderNames } from '../nodes/FirstSpiritRestApi/parameters';

function operationProperty(resource: string): INodeProperties | undefined {
	return nodeProperties.find(
		(property) =>
			property.name === 'operation' &&
			(property.displayOptions?.show?.resource as string[] | undefined)?.includes(resource),
	);
}

function operationValues(resource: string): string[] {
	const options = (operationProperty(resource)?.options ?? []) as INodePropertyOptions[];
	return options.map((option) => String(option.value));
}

const resources = resourceOptions.map((option) => String(option.value));

describe('descriptions', () => {
	it('offers no file-system based upload (verified nodes must not touch the file system)', () => {
		const names = nodeProperties.map((property) => property.name);
		expect(names).not.toContain('filePath');
		expect(names).not.toContain('uploadSource');
	});

	it('exposes every resource that has routes', () => {
		const routed = [...new Set(operationRoutes.map((route) => route.resource))].sort();
		expect(resources.slice().sort()).toEqual(expect.arrayContaining(routed));
	});

	it.each(resources)('offers exactly the routed operations for %s', (resource) => {
		const routed = operationRoutes
			.filter((route) => route.resource === resource)
			.map((route) => route.operation)
			.sort();
		expect(operationValues(resource).sort()).toEqual(routed);
	});

	it.each(resources)('gives every operation of %s an action', (resource) => {
		const options = (operationProperty(resource)?.options ?? []) as INodePropertyOptions[];
		for (const option of options) {
			expect(option.action ?? '').not.toBe('');
		}
	});

	it.each(resources)('defaults to an existing operation for %s', (resource) => {
		expect(operationValues(resource)).toContain(String(operationProperty(resource)?.default));
	});

	// ── Visibility of the fields execute() will read ──────────────────────────
	//
	// Checking that a field of the right NAME exists somewhere in nodeProperties is not enough:
	// a {pageUid} placeholder on a route of any other resource would pass because the page
	// resource happens to declare pageUid. These checks evaluate the real displayOptions and
	// require exactly one VISIBLE field per parameter for that resource and operation.

	function isVisible(property: INodeProperties, resource: string, operation: string): boolean {
		const show = property.displayOptions?.show as Record<string, unknown[]> | undefined;
		const hide = property.displayOptions?.hide as Record<string, unknown[]> | undefined;
		if (show?.resource !== undefined && !show.resource.includes(resource)) return false;
		if (show?.operation !== undefined && !show.operation.includes(operation)) return false;
		// hide ORs its conditions: any matching key hides the field.
		if (hide?.resource?.includes(resource)) return false;
		if (hide?.operation?.includes(operation)) return false;
		return true;
	}

	function visibleFields(name: string, resource: string, operation: string): INodeProperties[] {
		return nodeProperties.filter(
			(property) => property.name === name && isVisible(property, resource, operation),
		);
	}

	/** Every node parameter execute() reads for this route, apart from page/size. */
	function requiredFields(route: (typeof operationRoutes)[number]): string[] {
		const names = placeholderNames(route.path).map((placeholder) =>
			// The folder wildcard '**' is exposed as the readable field 'folderPath'.
			placeholder === '**' ? 'folderPath' : placeholder,
		);
		if (route.languageSuffix) names.push('language');
		for (const name of route.query ?? []) {
			if (name === 'page' || name === 'size') continue;
			names.push(name);
		}
		return names;
	}

	const routeCases = operationRoutes.map(
		(route) => [`${route.resource}:${route.operation}`, route] as const,
	);

	it.each(routeCases)('shows exactly one field per parameter of %s', (_label, route) => {
		for (const name of requiredFields(route)) {
			const visible = visibleFields(name, route.resource, route.operation);
			expect({ field: name, visible: visible.length }).toEqual({ field: name, visible: 1 });
		}
	});

	it('covers every route with the visibility check', () => {
		expect(routeCases).toHaveLength(operationRoutes.length);
		expect(routeCases.length).toBeGreaterThan(140);
	});

	it('gives every property a default', () => {
		for (const property of nodeProperties) {
			expect(property.default).toBeDefined();
		}
	});

	it('ends no description with a period', () => {
		// n8n's house convention, enforced by ESLint's
		// node-param-description-excess-final-period on the object literals it can
		// see statically. Builder-produced fields are invisible to that rule, so the
		// whole shipped property list is checked here instead. The sole exception is
		// the canonical dynamic-options help sentence, whose wording n8n mandates
		// verbatim -- including its final period.
		const offenders = nodeProperties
			.filter((property) => typeof property.description === 'string')
			.filter((property) => !property.description!.includes('docs.n8n.io/code/expressions'))
			.filter((property) => /\.$/.test(property.description!))
			.map((property) => property.name);
		expect(offenders).toEqual([]);
	});

	it('resource dropdown in nodeProperties lists exactly the resources in resourceOptions', () => {
		const resourceProp = nodeProperties.find((p) => p.name === 'resource');
		const inlineValues = ((resourceProp?.options ?? []) as INodePropertyOptions[])
			.map((o) => String(o.value))
			.sort();
		const exportedValues = resourceOptions.map((o) => String(o.value)).sort();
		expect(inlineValues).toEqual(exportedValues);
	});
});
