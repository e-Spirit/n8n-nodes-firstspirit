import { FirstSpiritRestApi } from '../nodes/FirstSpiritRestApi/FirstSpiritRestApi.node';

describe('FirstSpiritRestApi node', () => {
	const node = new FirstSpiritRestApi();

	it('carries the rebranded metadata', () => {
		expect(node.description.name).toBe('firstSpiritRestApi');
		expect(node.description.displayName).toBe('FirstSpirit REST API');
		expect(node.description.icon).toEqual({
			light: 'file:rezolve.svg',
			dark: 'file:rezolve.dark.svg',
		});
		expect(node.description.credentials?.[0].name).toBe('firstSpiritApi');
	});

	it('declares properties', () => {
		expect(node.description.properties.length).toBeGreaterThan(0);
	});
});
