import {
    ActionRequest,
    ActionContext,
    ValidationError,
    paramConverter,
    NotFoundError,
} from "adminjs";

import { Letters } from "../db/models/Letters.js";
import { LetterTypes } from "../db/models/LetterTypes.js";

export const LetterTypeCreateBefore = async (
    request: ActionRequest,
    context: ActionContext
) => {
    const { payload = {} } = request;

    if (request.method != "post") return request;

    const { type = "", language } = payload;
    const errors: Record<string, any> = {};

    if (!language) {
        errors.language = {
            message: "Select a language",
        };
        if (Object.keys(errors).length) {
            throw new ValidationError(errors);
        }
    }

    if (type) {
        const LetterType = await LetterTypes.findAll({
            where: { type: type, language: language },
        });

        if (LetterType.length > 0) {
            errors.type = {
                message:
                    "Cannot use this letter type, it is already exists in this language",
            };
            if (Object.keys(errors).length) {
                throw new ValidationError(errors);
            }
        }
    }
    return { request, context };
};

export const LetterTypeCreateHandler = async (props) => {
    if (props.error) {
        return {
            notice: {
                message: props.message,
                type: "error",
            },
        };
    } else {
        const { request, context } = props;
        const { resource, h, currentAdmin } = context;
        if (request.method === "post") {
            const params = paramConverter.prepareParams(
                request.payload ?? {},
                resource
            );

            let record = await resource.build(params);

            const newRecord = await LetterTypes.create({
                ...request.payload,
                created_by: currentAdmin.id,
                updated_by: currentAdmin.id,
            });
            if (newRecord) {
                return {
                    redirectUrl: h.resourceUrl({
                        resourceId: resource._decorated?.id() || resource.id(),
                    }),
                    notice: {
                        message: "successfullyCreated",
                        type: "success",
                    },
                    record: record.toJSON(currentAdmin),
                };
            } else {
                return {
                    record: record.toJSON(currentAdmin),
                    redirectUrl: h.resourceUrl({
                        resourceId: resource._decorated?.id() || resource.id(),
                    }),
                    notice: {
                        message: "Something went wrong,try again later",
                        type: "error",
                    },
                };
            }
        }
    }
};

export const LetterTypeEditBefore = async (request: ActionRequest) => {
    const { payload = {} } = request;

    if (request.method != "post") return request;

    const { type = "", language } = payload;
    const errors: Record<string, any> = {};

    if (!language) {
        errors.language = {
            message: "Select a language",
        };
        if (Object.keys(errors).length) {
            throw new ValidationError(errors);
        }
    }

    if (type) {
        const LetterType = await LetterTypes.findAll({
            where: { type: type, language: language },
        });

        if (LetterType.length > 0) {
            errors.type = {
                message:
                    "Cannot use this letter type, it is already exists in this language",
            };
            if (Object.keys(errors).length) {
                throw new ValidationError(errors);
            }
        }
    }
    return request;
};

export const LetterTypeEditHandler = async (request, response, context) => {
    const { record, resource, currentAdmin, h } = context;
    if (!record) {
        throw new NotFoundError(
            [
                `Record of given id ("${request.params.recordId}") could not be found`,
            ].join("\n"),
            "Action#handler"
        );
    }
    if (request.method === "get") {
        return { record: record.toJSON(currentAdmin) };
    }

    const newRecord = await LetterTypes.update(
        {
            type: request.payload.type,
            language: request.payload.language,
            updated_by: currentAdmin.id,
        },
        { where: { id: request.payload.id } }
    );
    if (newRecord) {
        return {
            redirectUrl: h.resourceUrl({
                resourceId: resource._decorated?.id() || resource.id(),
            }),
            notice: {
                message: "successfullyUpdated",
                type: "success",
            },
            record: record.toJSON(currentAdmin),
        };
    } else {
        return {
            record: record.toJSON(currentAdmin),
            redirectUrl: h.resourceUrl({
                resourceId: resource._decorated?.id() || resource.id(),
            }),
            notice: {
                message: "Something went wrong,try again later",
                type: "error",
            },
        };
    }
};

export const LetterTypeDeleteBefore = async (
    request: ActionRequest,
    context: ActionContext
) => {
    const letterTypeId = request.params?.recordId;

    if (letterTypeId) {
        const letters = await Letters.findAll({
            where: { id: letterTypeId },
        });

        if (letters.length > 0) {
            return {
                error: true,
                message:
                    "Cannot delete the letter type, it is associated with letter",
            };
        }
    }

    return { request, context };
};

export const LetterTypeDeleteHandler = async (props) => {
    const { request, context } = props;
    if (props.error) {
        return {
            notice: {
                message: props.message,
                type: "error",
            },
        };
    } else {
        const { record, resource, currentAdmin, h } = context;
        if (request.params.recordId) {
            await LetterTypes.destroy({
                where: {
                    id: request.params.recordId,
                },
            });

            const deletedLetterType = await LetterTypes.findOne({
                where: {
                    id: request.params.recordId,
                },
            });

            if (!deletedLetterType) {
                return {
                    record: record.toJSON(currentAdmin),
                    redirectUrl: h.resourceUrl({
                        resourceId: resource._decorated?.id() || resource.id(),
                    }),
                    notice: {
                        message: "successfullyDeleted",
                        type: "success",
                    },
                };
            } else {
                return {
                    record: record.toJSON(currentAdmin),
                    redirectUrl: h.resourceUrl({
                        resourceId: resource._decorated?.id() || resource.id(),
                    }),
                    notice: {
                        message: "Something went wrong,try again later",
                        type: "error",
                    },
                };
            }
        }
    }
};
