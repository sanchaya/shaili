import { TaggedLetters } from "../db/models/TaggedLetters.js";
import { Books } from "../db/models/Books.js";
import { ActionContext, ActionRequest } from "adminjs";
import { Comments } from "../db/models/Comments.js";
import TaggedLetterController from "../controllers/TaggedLetterController.js";
import fs from "fs";
import { mkdir, rename } from "node:fs/promises";

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
        const book = await Books.findOne({
            where: {
                id: request.params.recordId,
            },
        });
        const bookTags = await TaggedLetters.findAll({
            where: { book_id: request.params.recordId },
        });
        if (bookTags) {
            const tagsDirectory = TaggedLetterController.getTagsDirectory();
            const bookTagDirectory = `${tagsDirectory}/tags/${book?.dataValues.name}/`;
            const deletedPath = `${tagsDirectory}/tags/deleted/${book?.dataValues.name}/`;
            if (!fs.existsSync(deletedPath)) {
                await mkdir(deletedPath, {
                    recursive: true,
                });
            }
            const filesInTagsDirectory = fs.readdirSync(bookTagDirectory);
            if (filesInTagsDirectory.length > 0) {
                await rename(bookTagDirectory, deletedPath);
            }

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
        }
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
