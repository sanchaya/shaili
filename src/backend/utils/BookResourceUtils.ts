import { TaggedLetters } from "../db/models/TaggedLetters.js";
import { Books } from "../db/models/Books.js";
import { ActionContext, ActionRequest } from "adminjs";
import { Comments } from "../db/models/Comments.js";

export const BookDeleteBefore = async (
    request: ActionRequest,
    context: ActionContext
) => {
    return { request, context };
};

export const BookDeleteHandler = async (props) => {
    const { request, context } = props;
    const { record, resource, currentAdmin, h } = context;
    if (request.params.recordId) {
        await TaggedLetters.destroy({
            where: { book_id: request.params.recordId },
        });

        await Comments.destroy({
            where: { book: request.params.recordId },
        });

        await Books.destroy({
            where: {
                id: request.params.recordId,
            },
        });

        const deletedBook = await Books.findOne({
            where: {
                id: request.params.recordId,
            },
        });

        if (!deletedBook) {
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
                record: record?.toJSON(currentAdmin),
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
};
