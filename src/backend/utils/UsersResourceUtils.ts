import { NotFoundError, ValidationError } from "adminjs";
import * as argon2 from "argon2";
import Users from "../db/models/Users.js";
import { Op } from "sequelize";

export const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const isValidPassword = (password) => {
    const pattern =
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[~`!@#$%^&*()-_+={}[\]|\\:;"'<>,.?/]).{8,}$/;
    return pattern.test(password);
};

export const hashPassword = async (request, context) => {
    const { payload = {}, method, fields } = request;

    if (method !== "post") return request;

    const { email = null, name = "", role = "", password = "" } = payload;
    const errors: Record<string, any> = {};

    const isEmailFound = await Users.findOne({
        where: { email: email, id: { [Op.ne]: request.params.recordId } },
    });

    if (isEmailFound) {
        errors.email = {
            message: "Email already exists",
        };
    }

    if (!validateEmail(email)) {
        errors.email = {
            message: "Enter valid email address",
        };
    }

    if (name.trim().length === 0) {
        errors.name = {
            message: "Enter user name",
        };
    }
    if (!password && request.params.action === "new") {
        errors.newPassword = {
            message: "Enter a password",
        };
    }

    if (fields.newPassword && !isValidPassword(fields.newPassword)) {
        errors.newPassword = {
            message:
                "Must contain: 8 or more characters, 1 uppercase, 1 lowercase, 1 number, 1 special character.",
        };
    }

    if (!role) {
        errors.role = {
            message: "Select a role",
        };
    }

    if (Object.keys(errors).length) {
        throw new ValidationError(errors);
    }
    if (request.payload?.newPassword) {
        request.payload.newPassword = await argon2.hash(
            request.payload.newPassword
        );
    }
    return request;
};

export const UserEditHandler = async (request, response, context) => {
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

    const newRecord = await Users.update(
        {
            ...request.payload,
        },
        { where: { id: request.payload.id } }
    );
    if (newRecord) {
        return {
            redirectUrl:
                currentAdmin.role === 1
                    ? h.resourceUrl({
                          resourceId:
                              resource._decorated?.id() || resource.id(),
                      })
                    : "/admin",
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
