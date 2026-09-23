import { TaggedLetters } from "../db/models/TaggedLetters.js";
import { Books } from "../db/models/Books.js";
import { ActionContext, ActionRequest } from "adminjs";
import { Comments } from "../db/models/Comments.js";
import TaggedLetterController from "../controllers/TaggedLetterController.js";
import fs from "fs";
import { mkdir, rename } from "node:fs/promises";

const getTimeStamp = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    return `${year}${month}${day}_${hours}${minutes}${seconds}`;
};

export const BookDeleteBefore = async (
    request: ActionRequest,
    context: ActionContext
) => {
    return { request, context };
};

// Deletes a book with its tags and comments; tag images are moved to tags/deleted/, not removed.
export const deleteBook = async (id: string | number) => {
    const book = await Books.findOne({
        where: {
            id: id,
        },
    });
    const bookTags = await TaggedLetters.findAll({
        where: { book_id: id },
    });
    if (bookTags.length > 0) {
        const tagsDirectory = TaggedLetterController.getTagsDirectory();
        const bookTagDirectory = `${tagsDirectory}/tags/${book?.dataValues.identifier}/`;
        const deletedPath = `${tagsDirectory}/tags/deleted/${getTimeStamp()}_${
            book?.dataValues.identifier
        }/`;
        if (!fs.existsSync(deletedPath)) {
            await mkdir(deletedPath, {
                recursive: true,
            });
        }
        // A book can have tag rows but no folder (e.g. a moved tags dir); don't let that abort the delete.
        if (fs.existsSync(bookTagDirectory) && fs.readdirSync(bookTagDirectory).length > 0) {
            await rename(bookTagDirectory, deletedPath);
        }
    }
    await TaggedLetters.destroy({
        where: { book_id: id },
    });

    await Comments.destroy({
        where: { book: id },
    });

    await Books.destroy({
        where: {
            id: id,
        },
    });
};

export const BookDeleteHandler = async (props) => {
    const { request, context } = props;
    const { record, resource, currentAdmin, h } = context;
    if (request.params.recordId) {
        await deleteBook(request.params.recordId);
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

export const BookEditBefore = async (request: ActionRequest) => {
    const { payload = {} } = request;

    if (request.method !== "post") return request;

    payload.publisher_city =
        payload.publisher_city === "" ? null : payload.publisher_city;
    payload.publisher_name =
        payload.publisher_name === "" ? null : payload.publisher_name;
    payload.author_name =
        payload.author_name === "" ? null : payload.author_name;
    payload.printer_location =
        payload.printer_location === "" ? null : payload.printer_location;
    payload.printer_name =
        payload.printer_name === "" ? null : payload.printer_name;
    payload.published_year =
        payload.published_year === "" ? null : payload.published_year;

    return request;
};

// Bulk delete from the books list: same cleanup as a single delete, one book at a time.
export const BookBulkDeleteHandler = async (request: ActionRequest, _response, context: ActionContext) => {
    const { records = [], resource, h, currentAdmin } = context;
    const recordsJSON = records.map((record) => record.toJSON(currentAdmin));
    if (request.method !== "post") return { records: recordsJSON };

    for (const record of records) await deleteBook(record.id());
    return {
        records: recordsJSON,
        notice: {
            message: records.length > 1 ? "successfullyBulkDeleted_plural" : "successfullyBulkDeleted",
            options: { count: records.length },
            resourceId: resource.id(),
            type: "success",
        },
        redirectUrl: h.resourceUrl({ resourceId: resource._decorated?.id() || resource.id() }),
    };
};
