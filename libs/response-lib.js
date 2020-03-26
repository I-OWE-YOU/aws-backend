export function success(body) {
  return buildResponse(200, body);
}

export function failure(body) {
  return buildResponse(500, body);
}

export function validationError(body) {
  return buildResponse(400, { errors: body });
}

function buildResponse(statusCode, body) {
  return {
    statusCode,
    body: JSON.stringify(body)
  };
}
