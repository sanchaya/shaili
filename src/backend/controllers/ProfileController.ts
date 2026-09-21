import { Request, Response } from "express";
import Users from "../db/models/Users.js";
import UserRoles from "../db/models/UserRoles.js";
import { Letters } from "../db/models/Letters.js";
import { Books } from "../db/models/Books.js";
import * as argon2 from "argon2";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const avatarDir = path.join(__dirname, "../../public/avatars");

// Ensure avatar directory exists
if (!fs.existsSync(avatarDir)) {
    fs.mkdirSync(avatarDir, { recursive: true });
}

// Configure multer for avatar uploads
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, avatarDir),
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `avatar-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (_req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp/;
        const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
        const mimeOk = allowed.test(file.mimetype);
        if (extOk && mimeOk) {
            cb(null, true);
        } else {
            cb(new Error("Only image files (jpeg, png, gif, webp) are allowed"));
        }
    },
});

const ProfileController = {
    // GET /admin/profile - Get current user's profile
    getProfile: async (req: Request, res: Response) => {
        try {
            const userId = Number(req.headers["x-user-id"]);
            if (!userId) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const user = await Users.findByPk(userId, {
                include: [{ model: UserRoles, attributes: ["role"] }],
                attributes: {
                    exclude: ["password", "email_verification_token"],
                },
            });

            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            // Get activity stats
            const lettersTagged = await Letters.count({
                where: { created_by: userId },
            });
            const booksCount = await Books.count();

            const userData = user.toJSON();
            // Sequelize with underscored:true uses camelCase keys in toJSON
            const userRole = (userData as any).UserRole || (userData as any).UserRoles;
            const memberSince = (userData as any).createdAt || (userData as any).created_at;

            const profile = {
                ...userData,
                role_name: userRole?.role || "User",
                stats: {
                    lettersTagged,
                    booksCount,
                    memberSince,
                },
            };

            return res.json(profile);
        } catch (error) {
            console.error("Profile fetch error:", error);
            return res.status(500).json({ error: "Failed to fetch profile" });
        }
    },

    // PUT /admin/profile - Update current user's profile
    updateProfile: async (req: Request, res: Response) => {
        try {
            const userId = Number(req.headers["x-user-id"]);
            if (!userId) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const {
                name,
                bio,
                phone,
                organization,
                location,
                website,
                github_url,
                linkedin_url,
                preferred_language,
                timezone,
                currentPassword,
                newPassword,
            } = req.body;

            const user = await Users.findByPk(userId);
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            // If changing password, verify current password first
            if (newPassword) {
                if (!currentPassword) {
                    return res.status(400).json({ error: "Current password is required to set a new password" });
                }
                if (!user.password) {
                    return res.status(400).json({ error: "Cannot change password for Google sign-on accounts" });
                }
                const isValid = await user.comparePassword(user.password, currentPassword);
                if (!isValid) {
                    return res.status(400).json({ error: "Current password is incorrect" });
                }
                // Validate new password strength
                if (newPassword.length < 8) {
                    return res.status(400).json({ error: "Password must be at least 8 characters" });
                }
                if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword) || !/[!@#$%^&*]/.test(newPassword)) {
                    return res.status(400).json({
                        error: "Password must contain uppercase, lowercase, number, and special character",
                    });
                }
                const hashedPassword = await argon2.hash(newPassword);
                await user.update({ password: hashedPassword });
            }

            // Update profile fields
            await user.update({
                name: name || user.name,
                bio: bio ?? user.bio,
                phone: phone ?? user.phone,
                organization: organization ?? user.organization,
                location: location ?? user.location,
                website: website ?? user.website,
                github_url: github_url ?? user.github_url,
                linkedin_url: linkedin_url ?? user.linkedin_url,
                preferred_language: preferred_language ?? user.preferred_language,
                timezone: timezone ?? user.timezone,
            });

            const updatedUser = await Users.findByPk(userId, {
                include: [{ model: UserRoles, attributes: ["role"] }],
                attributes: {
                    exclude: ["password", "email_verification_token"],
                },
            });

            if (!updatedUser) {
                return res.status(404).json({ error: "User not found" });
            }

            const updatedData = updatedUser.toJSON();
            const updatedRole = (updatedData as any).UserRole || (updatedData as any).UserRoles;

            return res.json({
                message: "Profile updated successfully",
                profile: {
                    ...updatedData,
                    role_name: updatedRole?.role || "User",
                },
            });
        } catch (error) {
            console.error("Profile update error:", error);
            return res.status(500).json({ error: "Failed to update profile" });
        }
    },

    // POST /admin/profile/avatar - Upload avatar
    uploadAvatar: [
        upload.single("avatar"),
        async (req: Request, res: Response) => {
            try {
                const userId = Number(req.headers["x-user-id"]);
                if (!userId) {
                    return res.status(401).json({ error: "Unauthorized" });
                }

                if (!(req as any).file) {
                    return res.status(400).json({ error: "No file uploaded" });
                }

                const avatarUrl = `/avatars/${(req as any).file.filename}`;

                await Users.update(
                    { avatar_url: avatarUrl },
                    { where: { id: userId } }
                );

                return res.json({
                    message: "Avatar uploaded successfully",
                    avatar_url: avatarUrl,
                });
            } catch (error) {
                console.error("Avatar upload error:", error);
                return res.status(500).json({ error: "Failed to upload avatar" });
            }
        },
    ],
};

export default ProfileController;
