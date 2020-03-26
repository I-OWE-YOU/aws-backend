export function success(body) {
  return buildResponse(200, body);
}

export function failure(body) {
  return buildResponse(500, body);
}

export function validationError(body) {
  return buildResponse(422, { errors: body });
}

export function resourceNotFound(body) {
  return buildResponse(404, body);
}

function buildResponse(statusCode, body) {
  return {
    statusCode,
    body: JSON.stringify(body)
  };
}
