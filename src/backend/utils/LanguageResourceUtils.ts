import {
    ActionContext,
    ActionRequest,
    NotFoundError,
    ValidationError,
    paramConverter,
} from "adminjs";
import { LetterTypes } from "../db/models/LetterTypes.js";
import { Books } from "../db/models/Books.js";
import { Languages } from "../db/models/Languages.js";

export const LanguageCreateBefore = async (
    request: ActionRequest,
    context: ActionContext
) => {
    const { payload = {} } = request;
    payload.language_code = payload.language_code.toLowerCase();

    if (request.method != "post") return request;

    const { language_code = "" } = payload;
    const errors: Record<string, any> = {};

    if (language_code) {
        const language = await Languages.findAll({
            where: { language_code: language_code },
        });

        if (language.length > 0) {
            errors.language_code = {
                message: "Cannot use this language code, it is already exists",
            };
            if (Object.keys(errors).length) {
                throw new ValidationError(errors);
            }
        }
    }
    return { request, context };
};

export const LanguageCreateHandler = async (props) => {
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

            const newRecord = await Languages.create({
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

export const LanguageEditBefore = async (request: ActionRequest) => {
    const { payload = {} } = request;
    payload.language_code = payload.language_code.toLowerCase();
    
    if (request.method != "post") return request;

    const languageCode = request.params.recordId;
    const { language_code = "" } = payload;
    const errors: Record<string, any> = {};

    if (language_code != languageCode) {
        const books = await Books.findAll({
            where: { language: languageCode },
        });
        const letterTypes = await LetterTypes.findAll({
            where: { language: languageCode },
        });

        if (books.length > 0 || letterTypes.length > 0) {
            errors.language_code = {
                message:
                    "Cannot edit the language code, when it is associated with a book/letter type",
            };
            if (Object.keys(errors).length) {
                throw new ValidationError(errors);
            }
        }
    }
    return request;
};

export const LanguageEditHandler = async (request, response, context) => {
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

    const newRecord = await Languages.update(
        {
            language: request.payload.language,
            language_code: request.payload.language_code,
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

export const LanguageDeleteBefore = async (
    request: ActionRequest,
    context: ActionContext
) => {
    const languageCode = request.params.recordId;

    if (languageCode) {
        const books = await Books.findAll({
            where: { language: languageCode },
        });
        const letterTypes = await LetterTypes.findAll({
            where: { language: languageCode },
        });

        if (books.length > 0 || letterTypes.length > 0) {
            return {
                error: true,
                message:
                    "Cannot delete the language, it is associated with a book/letter type",
            };
        }
    }

    return { request, context };
};

export const LanguageDeleteHandler = async (props) => {
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
            await Languages.destroy({
                where: {
                    language_code: request.params.recordId,
                },
            });

            const deletedLanguage = await Languages.findOne({
                where: {
                    language_code: request.params.recordId,
                },
            });

            if (!deletedLanguage) {
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
