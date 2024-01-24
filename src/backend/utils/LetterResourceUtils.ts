import { ActionRequest, ActionContext } from "adminjs";
import { TaggedLetters } from "../db/models/TaggedLetters.js";
import { Letters } from "../db/models/Letters.js";

export const LetterDeleteBefore = async (
    request: ActionRequest,
    context: ActionContext
) => {
    const letterId = request.params?.recordId;

    if (letterId) {
        const taggedLetters = await TaggedLetters.findAll({
            where: { letter_id: letterId },
        });

        if (taggedLetters.length > 0) {
            return {
                error: true,
                message:
                    "Cannot delete the letter, it is associated with a tag",
            };
        }
    }

    return { request, context };
};

export const LetterDeleteHandler = async (props) => {
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
            await Letters.destroy({
                where: {
                    id: request.params.recordId,
                },
            });

            const deletedLetter = await Letters.findOne({
                where: {
                    id: request.params.recordId,
                },
            });

            if (!deletedLetter) {
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
