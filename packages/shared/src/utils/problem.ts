import { ProblemDetails } from '../types';

/**
 * Create RFC7807 Problem Details object
 */
export function createProblemDetails(
  status: number,
  title: string,
  detail?: string,
  type?: string,
  instance?: string
): ProblemDetails {
  return {
    type: type || `https://httpstatuses.com/${status}`,
    title,
    status,
    detail,
    instance,
  };
}

/**
 * Common problem details
 */
export const ProblemTypes = {
  BAD_REQUEST: (detail?: string, instance?: string) =>
    createProblemDetails(400, 'Bad Request', detail, undefined, instance),
  
  UNAUTHORIZED: (detail?: string, instance?: string) =>
    createProblemDetails(401, 'Unauthorized', detail, undefined, instance),
  
  FORBIDDEN: (detail?: string, instance?: string) =>
    createProblemDetails(403, 'Forbidden', detail, undefined, instance),
  
  NOT_FOUND: (detail?: string, instance?: string) =>
    createProblemDetails(404, 'Not Found', detail, undefined, instance),
  
  CONFLICT: (detail?: string, instance?: string) =>
    createProblemDetails(409, 'Conflict', detail, undefined, instance),
  
  UNPROCESSABLE_ENTITY: (detail?: string, instance?: string) =>
    createProblemDetails(422, 'Unprocessable Entity', detail, undefined, instance),
  
  INTERNAL_SERVER_ERROR: (detail?: string, instance?: string) =>
    createProblemDetails(500, 'Internal Server Error', detail, undefined, instance),
};
