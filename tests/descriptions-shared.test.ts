import {
	jsonBodyField,
	languageField,
	projectField,
	releasedField,
	returnAllFields,
	stringField,
} from '../nodes/FirstSpiritRestApi/descriptions/shared';

describe('shared description fields', () => {
	it('offers the project as a resource locator with list and id mode', () => {
		expect(projectField.name).toBe('projectId');
		expect(projectField.type).toBe('resourceLocator');
		expect((projectField.modes ?? []).map((m) => m.name)).toEqual(['list', 'id']);
	});

	it('makes the language field optional and empty by default', () => {
		const field = languageField({ resource: ['page'], operation: ['getFormEditor'] });
		expect(field.name).toBe('language');
		expect(field.type).toBe('resourceLocator');
		expect(field.default).toEqual({ mode: 'list', value: '' });
		expect(field.required).toBeFalsy();
	});

	it('describes the released flag starting with Whether', () => {
		const field = releasedField({ resource: ['page'], operation: ['get'] });
		expect(field.type).toBe('boolean');
		expect(field.default).toBe(false);
		expect(field.description).toMatch(/^Whether/);
	});

	it('enforces n8n field-type-specific conventions for descriptions and displayNames', () => {
		// n8n convention: descriptions carry no trailing period. ESLint's
		// node-param-description-excess-final-period enforces this only on object
		// literals it can see statically, so builder-produced fields are guarded here.
		expect(projectField.description).not.toMatch(/\.$/);
		// stringField passes the given description through unchanged
		const stringFieldInstance = stringField('pageUid', 'Page UID', 'The UID of the page', {
			resource: ['page'],
		});
		expect(stringFieldInstance.description).toBe('The UID of the page');

		// languageField: displayName ending in "Name or ID" (n8n convention)
		const languageFieldInstance = languageField({ resource: ['page'] });
		expect(languageFieldInstance.displayName).toBe('Language Name or ID');
		// languageField: description contains canonical n8n help text
		expect(languageFieldInstance.description).toContain(
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		);
		// but preserves original helpful information
		expect(languageFieldInstance.description).toContain(
			'Leave empty to use the endpoint without a language',
		);

		// releasedField: no period, but starts with "Whether"
		const releasedFieldInstance = releasedField({ resource: ['page'] });
		expect(releasedFieldInstance.description).toMatch(/^Whether/);
		expect(releasedFieldInstance.description).not.toMatch(/\.$/);

		// jsonBodyField: no period
		const jsonFieldInstance = jsonBodyField({ resource: ['page'] });
		expect(jsonFieldInstance.description).not.toMatch(/\.$/);

		// returnAll and limit: exact n8n-mandated wording (no periods)
		const [returnAll, limit] = returnAllFields({ resource: ['search'] });
		expect(returnAll.description).toBe('Whether to return all results or only up to a given limit');
		expect(limit.description).toBe('Max number of results to return');
	});

	it('hides the limit field when Return All is on', () => {
		const [returnAll, limit] = returnAllFields({ resource: ['search'], operation: ['search'] });
		expect(returnAll.name).toBe('returnAll');
		expect(returnAll.default).toBe(false);
		expect(limit.name).toBe('limit');
		expect(limit.displayOptions?.show?.returnAll).toEqual([false]);
		expect(limit.typeOptions?.minValue).toBe(1);
	});

	it('carries the given displayOptions through', () => {
		const field = stringField('pageUid', 'Page UID', 'The UID of the page.', {
			resource: ['page'],
			operation: ['get'],
		});
		expect(field.displayOptions?.show).toEqual({ resource: ['page'], operation: ['get'] });
		expect(field.required).toBe(true);
	});
});
