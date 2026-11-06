import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeApiError,
	NodeConnectionTypes,
	NodeOperationError,
} from 'n8n-workflow';
import { nodeProperties } from './descriptions';
import { findRoute } from './operations';
import { collectParams } from './parameters';
import { firstSpiritApiRequest } from './transport/request';
import { extractItems, fetchAllPages } from './transport/pagination';
import { buildUploadBody, downloadBinary } from './transport/binary';
import { methods as nodeMethods } from './methods';

export class FirstSpiritRestApi implements INodeType {
	methods = nodeMethods;

	description: INodeTypeDescription = {
		displayName: 'FirstSpirit REST API',
		name: 'firstSpiritRestApi',
		icon: { light: 'file:rezolve.svg', dark: 'file:rezolve.dark.svg' },
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the FirstSpirit REST API',
		defaults: { name: 'FirstSpirit REST API' },
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'firstSpiritApi', required: true }],
		properties: nodeProperties,
		usableAsTool: true,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;
				const route = findRoute(resource, operation);
				if (route === undefined) {
					throw new NodeOperationError(
						this.getNode(),
						`Unsupported operation "${operation}" for resource "${resource}"`,
						{ itemIndex: i },
					);
				}

				const params = await collectParams.call(this, route, i);

				if (route.accept === 'binary') {
					const binaryPropertyName = this.getNodeParameter(
						'binaryPropertyName',
						i,
						'data',
					) as string;
					const binary = await downloadBinary.call(this, route, params, binaryPropertyName);
					returnData.push({ json: { ...items[i].json }, binary, pairedItem: { item: i } });
					continue;
				}

				if (route.paginated === true) {
					const returnAll = this.getNodeParameter('returnAll', i, false) as boolean;
					const limit = this.getNodeParameter('limit', i, 50) as number;
					const pageSize = returnAll ? 100 : Math.max(1, limit);
					const collected = await fetchAllPages.call(
						this,
						route,
						params,
						pageSize,
						returnAll ? undefined : Math.max(1, limit),
						i,
					);
					returnData.push(
						...collected.map((entry) => ({
							json: entry as INodeExecutionData['json'],
							pairedItem: { item: i },
						})),
					);
					continue;
				}

				const body = await buildBody.call(this, route, i);
				const response = await firstSpiritApiRequest.call(this, { route, params, body });

				const splitItems = this.getNodeParameter('splitItems', i, true) as boolean;
				if (splitItems && Array.isArray(response)) {
					returnData.push(
						...extractItems(response).map((entry) => ({
							json: entry as INodeExecutionData['json'],
							pairedItem: { item: i },
						})),
					);
				} else {
					returnData.push({
						json: (typeof response === 'object' && response !== null
							? response
							: { data: response }) as INodeExecutionData['json'],
						pairedItem: { item: i },
					});
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw error instanceof NodeApiError || error instanceof NodeOperationError
					? error
					: new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
			}
		}

		return [returnData];
	}
}

async function buildBody(
	this: IExecuteFunctions,
	route: ReturnType<typeof findRoute>,
	itemIndex: number,
): Promise<unknown> {
	if (route === undefined) return undefined;

	if (route.bodyParams !== undefined) {
		const body: Record<string, unknown> = {};
		for (const bodyKey of route.bodyParams) {
			const paramName = route.bodyParamRenames?.[bodyKey] ?? bodyKey;
			const resolved = this.getNodeParameter(paramName, itemIndex, undefined, {
				extractValue: true,
			}) as unknown;

			if (resolved === undefined || resolved === '') continue;
			const cast = route.bodyParamTypes?.[bodyKey];
			if (cast === 'number') {
				const n = Number(resolved);
				if (Number.isNaN(n)) {
					throw new NodeOperationError(
						this.getNode(),
						`The parameter "${paramName}" must be a number, got "${String(resolved)}"`,
						{ itemIndex },
					);
				}
				body[bodyKey] = n;
			} else if (cast === 'boolean') {
				body[bodyKey] = resolved === true || resolved === 'true';
			} else {
				body[bodyKey] = resolved;
			}
		}
		return body;
	}

	switch (route.body) {
		case 'json': {
			const raw = this.getNodeParameter('body', itemIndex, '{}') as string;
			try {
				return typeof raw === 'string' ? JSON.parse(raw) : raw;
			} catch (error) {
				throw new NodeOperationError(
					this.getNode(),
					`The body is not valid JSON: ${(error as Error).message}`,
					{ itemIndex },
				);
			}
		}
		case 'text':
		case 'xml':
			return this.getNodeParameter('textBody', itemIndex, '') as string;
		case 'multipart': {
			const binaryPropertyName = this.getNodeParameter(
				'binaryPropertyName',
				itemIndex,
				'data',
			) as string;
			return buildUploadBody.call(this, itemIndex, binaryPropertyName);
		}
		default:
			return undefined;
	}
}
