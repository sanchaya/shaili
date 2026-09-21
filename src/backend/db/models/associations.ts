import { Languages } from "./Languages.js";
import { LetterTypes } from "./LetterTypes.js";
import { Books } from "./Books.js";
import { Letters } from "./Letters.js";
import Users from "./Users.js";
import { TaggedLetters } from "./TaggedLetters.js";
import BookStatus from "./BookStatus.js";
import { Comments } from "./Comments.js";
import UserRoles from "./UserRoles.js";

const models = {
    Languages,
    LetterTypes,
    Books,
    Letters,
    Users,
    TaggedLetters,
    BookStatus,
    Comments,
    UserRoles,
};

Object.values(models).forEach((model: any) => {
    if (model.associate) {
        model.associate(models);
    }
});

export function setupAssociations() {
    // Associations are set up when models object is created
}