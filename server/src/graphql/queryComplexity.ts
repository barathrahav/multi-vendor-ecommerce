import { getComplexity, fieldExtensionsEstimator, simpleEstimator } from "graphql-query-complexity";
import { logger } from "../config/logger";

export const createQueryComplexityPlugin = () => {
  const maxComplexity = Number(process.env.GRAPHQL_COMPLEXITY_LIMIT || 150);

  return {
    requestDidStart: async () => ({
      didResolveOperation: async (requestContext: any) => {
        // Skip complexity check for introspection queries
        const query = requestContext.document;
        const isIntrospection = query.definitions.some((def: any) => {
          if (def.kind === 'OperationDefinition' && def.operation === 'query') {
            return def.selectionSet.selections.some((selection: any) => {
              return selection.name && (
                selection.name.value === '__schema' ||
                selection.name.value === '__type' ||
                selection.name.value.startsWith('__')
              );
            });
          }
          return false;
        });

        if (isIntrospection) {
          logger.debug("Skipping complexity check for introspection query");
          return;
        }

        const complexity = getComplexity({
          schema: requestContext.schema,
          query: requestContext.document,
          variables: requestContext.request.variables || {},
          estimators: [
            fieldExtensionsEstimator(),
            simpleEstimator({ defaultComplexity: 1 }),
          ],
        });

        if (complexity > maxComplexity) {
          logger.warn(
            { complexity, maxComplexity },
            "Blocked GraphQL query for excessive complexity"
          );
          throw new Error(
            `GraphQL query is too complex: ${complexity}. Maximum allowed complexity: ${maxComplexity}.`
          );
        }

        logger.debug({ complexity }, "GraphQL query complexity calculated");
      },
    }),
  };
};
