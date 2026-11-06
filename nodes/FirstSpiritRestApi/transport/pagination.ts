import { IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import { OperationRoute } from '../types';
import { firstSpiritApiRequest } from './request';

/** Safety net: the API may ignore page/size and keep returning the same page forever. */
export const MAX_PAGES = 200;

export function extractItems(response: unknown): unknown[] {
	if (response === null || response === undefined) return [];
	if (Array.isArray(response)) return response;
	if (typeof response === 'object') {
		const firstArray = Object.values(response as Record<string, unknown>).find(Array.isArray);
		if (firstArray !== undefined) return firstArray as unknown[];
		return [response];
	}
	return [response];
}

/**
 * Requests consecutive pages until the server returns a short page or `maxItems` have been
 * collected, whichever comes first.
 *
 * When `maxItems` is given the loop stops as soon as that many items are in hand, so a bounded
 * request never downloads more than one page beyond what the user asked for.
 *
 * Exhausting MAX_PAGES without a short page means the result would be truncated. Rather than
 * returning a partial list that looks complete, this raises a NodeOperationError.
 */
export async function fetchAllPages(
	this: IExecuteFunctions,
	route: OperationRoute,
	params: Record<string, unknown>,
	pageSize: number,
	maxItems?: number,
	itemIndex?: number,
): Promise<unknown[]> {
	const collected: unknown[] = [];

	for (let page = 0; page < MAX_PAGES; page++) {
		const response = await firstSpiritApiRequest.call(this, {
			route,
			params: { ...params, page, size: pageSize },
		});
		const items = extractItems(response);
		collected.push(...items);
		if (maxItems !== undefined && collected.length >= maxItems) {
			return collected.slice(0, maxItems);
		}
		if (items.length < pageSize) return collected;
	}

	throw new NodeOperationError(
		this.getNode(),
		`The FirstSpirit REST API kept returning full pages after ${MAX_PAGES} requests`,
		{
			description: `Stopped after ${MAX_PAGES} pages of ${pageSize} items to avoid an endless loop. Narrow the request, or turn Return All off and set a Limit, so the result is not silently truncated`,
			itemIndex,
		},
	);
}
