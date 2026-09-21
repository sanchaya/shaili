import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCurrentAdmin, useNotice } from "adminjs";
import {
    Box,
    Button,
    Header,
    Icon,
    Input,
    Loader,
    TextArea,
    Text,
} from "@adminjs/design-system";
import { styled } from "styled-components";

interface UserProfile {
    id: number;
    name: string;
    email: string;
    role: number;
    role_name: string;
    avatar_url: string | null;
    bio: string | null;
    phone: string | null;
    organization: string | null;
    location: string | null;
    website: string | null;
    github_url: string | null;
    linkedin_url: string | null;
    preferred_language: string | null;
    timezone: string | null;
    is_google_sign_on: boolean;
    stats: {
        lettersTagged: number;
        booksCount: number;
        memberSince: string;
    };
}

const ProfileContainer = styled.div`
    max-width: 960px;
    margin: 0 auto;
    padding: 24px;
`;

const ProfileHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 24px;
    padding: 32px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16px;
    color: white;
    margin-bottom: 24px;
`;

const AvatarContainer = styled.div`
    position: relative;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    overflow: hidden;
    border: 4px solid rgba(255, 255, 255, 0.3);
    cursor: pointer;
    flex-shrink: 0;

    &:hover .avatar-overlay {
        opacity: 1;
    }
`;

const AvatarOverlay = styled.div`
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s;
`;

const AvatarImg = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
`;

const AvatarPlaceholder = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.2);
    font-size: 40px;
    font-weight: bold;
`;

const SectionCard = styled.div`
    background: white;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    border: 1px solid #eee;
`;

const SectionTitle = styled.h3`
    font-size: 16px;
    font-weight: 600;
    color: #1a1a2e;
    margin: 0 0 20px 0;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    align-items: center;
    gap: 8px;
`;

const FormGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;

    @media (max-width: 640px) {
        grid-template-columns: 1fr;
    }
`;

const FormGroup = styled.div`
    margin-bottom: 0;
`;

const Label = styled.label`
    display: block;
    font-size: 13px;
    font-weight: 500;
    color: #555;
    margin-bottom: 6px;
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;

    @media (max-width: 640px) {
        grid-template-columns: 1fr;
    }
`;

const StatCard = styled.div`
    text-align: center;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 10px;
`;

const StatValue = styled.div`
    font-size: 28px;
    font-weight: 700;
    color: #667eea;
`;

const StatLabel = styled.div`
    font-size: 13px;
    color: #666;
    margin-top: 4px;
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #f0f0f0;
`;

const PasswordSection = styled.div`
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;
`;

const LanguageOptions = [
    { value: "eng", label: "English" },
    { value: "hin", label: "Hindi" },
    { value: "ben", label: "Bengali" },
    { value: "tel", label: "Telugu" },
    { value: "mar", label: "Marathi" },
    { value: "tam", label: "Tamil" },
    { value: "urd", label: "Urdu" },
    { value: "guj", label: "Gujarati" },
    { value: "kan", label: "Kannada" },
    { value: "mal", label: "Malayalam" },
    { value: "ori", label: "Odia" },
    { value: "pan", label: "Punjabi" },
    { value: "asm", label: "Assamese" },
    { value: "san", label: "Sanskrit" },
];

const TimezoneOptions = [
    { value: "Asia/Kolkata", label: "India (IST)" },
    { value: "America/New_York", label: "Eastern Time (ET)" },
    { value: "America/Chicago", label: "Central Time (CT)" },
    { value: "America/Denver", label: "Mountain Time (MT)" },
    { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
    { value: "Europe/London", label: "London (GMT)" },
    { value: "Europe/Berlin", label: "Berlin (CET)" },
    { value: "Asia/Tokyo", label: "Tokyo (JST)" },
    { value: "Asia/Shanghai", label: "Shanghai (CST)" },
    { value: "Asia/Dubai", label: "Dubai (GST)" },
    { value: "Australia/Sydney", label: "Sydney (AEST)" },
];

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const [currentAdmin] = useCurrentAdmin();
    const addNotice = useNotice();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const BASE_URL = (window as any).AdminJS?.env?.BASE_URL || '';

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    // Editable fields
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [phone, setPhone] = useState("");
    const [organization, setOrganization] = useState("");
    const [location_, setLocation] = useState("");
    const [website, setWebsite] = useState("");
    const [githubUrl, setGithubUrl] = useState("");
    const [linkedinUrl, setLinkedinUrl] = useState("");
    const [preferredLanguage, setPreferredLanguage] = useState("eng");
    const [timezone, setTimezone] = useState("Asia/Kolkata");

    // Password fields
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPasswordSection, setShowPasswordSection] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/profile`, {
                headers: { "X-User-Id": String(currentAdmin?.id) },
            });
            const data = response.data;
            setProfile(data);
            setName(data.name || "");
            setBio(data.bio || "");
            setPhone(data.phone || "");
            setOrganization(data.organization || "");
            setLocation(data.location || "");
            setWebsite(data.website || "");
            setGithubUrl(data.github_url || "");
            setLinkedinUrl(data.linkedin_url || "");
            setPreferredLanguage(data.preferred_language || "eng");
            setTimezone(data.timezone || "Asia/Kolkata");
        } catch (error) {
            console.error("Failed to fetch profile:", error);
            addNotice({ message: "Failed to load profile", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            addNotice({ message: "Name is required", type: "error" });
            return;
        }

        if (newPassword && newPassword !== confirmPassword) {
            addNotice({ message: "New passwords do not match", type: "error" });
            return;
        }

        if (newPassword && !currentPassword) {
            addNotice({
                message: "Current password is required to set a new password",
                type: "error",
            });
            return;
        }

        setSaving(true);
        try {
            const payload: any = {
                name,
                bio,
                phone,
                organization,
                location: location_,
                website,
                github_url: githubUrl,
                linkedin_url: linkedinUrl,
                preferred_language: preferredLanguage,
                timezone,
            };

            if (newPassword) {
                payload.currentPassword = currentPassword;
                payload.newPassword = newPassword;
            }

            await axios.put(`${BASE_URL}/profile`, payload, {
                headers: { "X-User-Id": String(currentAdmin?.id) },
            });
            addNotice({ message: "Profile updated successfully", type: "success" });

            // Clear password fields
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setShowPasswordSection(false);

            // Refresh profile data
            fetchProfile();
        } catch (error: any) {
            const message =
                error.response?.data?.error || "Failed to update profile";
            addNotice({ message, type: "error" });
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarUpload = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("avatar", file);

        setUploadingAvatar(true);
        try {
            const response = await axios.post(
                `${BASE_URL}/profile/avatar`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        "X-User-Id": String(currentAdmin?.id),
                    },
                }
            );
            setProfile((prev) =>
                prev
                    ? { ...prev, avatar_url: response.data.avatar_url }
                    : prev
            );
            addNotice({ message: "Avatar updated successfully", type: "success" });
        } catch (error: any) {
            const message =
                error.response?.data?.error || "Failed to upload avatar";
            addNotice({ message, type: "error" });
        } finally {
            setUploadingAvatar(false);
        }
    };

    if (loading) {
        return (
            <Box
                variant="container"
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "50vh",
                }}
            >
                <Loader />
            </Box>
        );
    }

    if (!profile) {
        return (
            <Box variant="container">
                <Text>Failed to load profile.</Text>
            </Box>
        );
    }

    const initials = profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <ProfileContainer>
            {/* Profile Header */}
            <ProfileHeader>
                <AvatarContainer onClick={handleAvatarClick}>
                    {profile.avatar_url ? (
                        <AvatarImg
                            src={profile.avatar_url}
                            alt={profile.name}
                        />
                    ) : (
                        <AvatarPlaceholder>{initials}</AvatarPlaceholder>
                    )}
                    <AvatarOverlay className="avatar-overlay">
                        <Icon icon="Camera" color="white" />
                    </AvatarOverlay>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        style={{ display: "none" }}
                    />
                </AvatarContainer>
                <div>
                    <Header.H2 style={{ margin: 0, color: "white" }}>
                        {profile.name}
                    </Header.H2>
                    <Text style={{ color: "rgba(255,255,255,0.8)", margin: "4px 0 0" }}>
                        {profile.email}
                    </Text>
                    <Text
                        style={{
                            color: "rgba(255,255,255,0.6)",
                            fontSize: "12px",
                            margin: "8px 0 0",
                        }}
                    >
                        {profile.role_name} • Member since{" "}
                        {new Date(profile.stats.memberSince).toLocaleDateString(
                            "en-US",
                            { year: "numeric", month: "long" }
                        )}
                    </Text>
                </div>
            </ProfileHeader>

            {/* Stats */}
            <StatsGrid>
                <StatCard>
                    <StatValue>{profile.stats.lettersTagged}</StatValue>
                    <StatLabel>Letters Tagged</StatLabel>
                </StatCard>
                <StatCard>
                    <StatValue>{profile.stats.booksCount}</StatValue>
                    <StatLabel>Total Books</StatLabel>
                </StatCard>
                <StatCard>
                    <StatValue>
                        {Math.floor(
                            (Date.now() -
                                new Date(profile.stats.memberSince).getTime()) /
                                (1000 * 60 * 60 * 24)
                        )}
                    </StatValue>
                    <StatLabel>Days Active</StatLabel>
                </StatCard>
            </StatsGrid>

            {/* Personal Information */}
            <SectionCard>
                <SectionTitle>
                    <Icon icon="User" /> Personal Information
                </SectionTitle>
                <FormGrid>
                    <FormGroup>
                        <Label>Full Name</Label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your full name"
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label>Email</Label>
                        <Input
                            value={profile.email}
                            disabled
                            style={{ opacity: 0.7 }}
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label>Phone</Label>
                        <Input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+91 98765 43210"
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label>Organization</Label>
                        <Input
                            value={organization}
                            onChange={(e) => setOrganization(e.target.value)}
                            placeholder="Company or institution"
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label>Location</Label>
                        <Input
                            value={location_}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="City, Country"
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label>Bio</Label>
                        <TextArea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell us about yourself..."
                            rows={3}
                        />
                    </FormGroup>
                </FormGrid>
            </SectionCard>

            {/* Social Links */}
            <SectionCard>
                <SectionTitle>
                    <Icon icon="Link" /> Social Links
                </SectionTitle>
                <FormGrid>
                    <FormGroup>
                        <Label>Website</Label>
                        <Input
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            placeholder="https://yourwebsite.com"
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label>GitHub</Label>
                        <Input
                            value={githubUrl}
                            onChange={(e) => setGithubUrl(e.target.value)}
                            placeholder="https://github.com/username"
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label>LinkedIn</Label>
                        <Input
                            value={linkedinUrl}
                            onChange={(e) => setLinkedinUrl(e.target.value)}
                            placeholder="https://linkedin.com/in/username"
                        />
                    </FormGroup>
                </FormGrid>
            </SectionCard>

            {/* Preferences */}
            <SectionCard>
                <SectionTitle>
                    <Icon icon="Settings" /> Preferences
                </SectionTitle>
                <FormGrid>
                    <FormGroup>
                        <Label>Preferred Language</Label>
                        <select
                            value={preferredLanguage}
                            onChange={(e) => setPreferredLanguage(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "8px 12px",
                                borderRadius: "4px",
                                border: "1px solid #ccc",
                                fontSize: "14px",
                                background: "white",
                            }}
                        >
                            {LanguageOptions.map((lang) => (
                                <option key={lang.value} value={lang.value}>
                                    {lang.label}
                                </option>
                            ))}
                        </select>
                    </FormGroup>
                    <FormGroup>
                        <Label>Timezone</Label>
                        <select
                            value={timezone}
                            onChange={(e) => setTimezone(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "8px 12px",
                                borderRadius: "4px",
                                border: "1px solid #ccc",
                                fontSize: "14px",
                                background: "white",
                            }}
                        >
                            {TimezoneOptions.map((tz) => (
                                <option key={tz.value} value={tz.value}>
                                    {tz.label}
                                </option>
                            ))}
                        </select>
                    </FormGroup>
                </FormGrid>
            </SectionCard>

            {/* Account Security */}
            <SectionCard>
                <SectionTitle>
                    <Icon icon="Lock" /> Account Security
                </SectionTitle>
                {profile.is_google_sign_on ? (
                    <Text style={{ color: "#666" }}>
                        Your account is linked to Google Sign-In. Password
                        management is handled by Google.
                    </Text>
                ) : (
                    <>
                        <Button
                            variant="outlined"
                            onClick={() => setShowPasswordSection(!showPasswordSection)}
                        >
                            {showPasswordSection
                                ? "Cancel Password Change"
                                : "Change Password"}
                        </Button>
                        {showPasswordSection && (
                            <PasswordSection>
                                <FormGrid>
                                    <FormGroup>
                                        <Label>Current Password</Label>
                                        <Input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) =>
                                                setCurrentPassword(e.target.value)
                                            }
                                            placeholder="Enter current password"
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label>New Password</Label>
                                        <Input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) =>
                                                setNewPassword(e.target.value)
                                            }
                                            placeholder="Enter new password"
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label>Confirm New Password</Label>
                                        <Input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) =>
                                                setConfirmPassword(e.target.value)
                                            }
                                            placeholder="Confirm new password"
                                        />
                                    </FormGroup>
                                </FormGrid>
                                <Text
                                    style={{
                                        fontSize: "12px",
                                        color: "#888",
                                        marginTop: "8px",
                                    }}
                                >
                                    Password must be at least 8 characters with
                                    uppercase, lowercase, number, and special
                                    character.
                                </Text>
                            </PasswordSection>
                        )}
                    </>
                )}
            </SectionCard>

            {/* Save Button */}
            <ActionButtons>
                <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? "Saving..." : "Save Changes"}
                </Button>
            </ActionButtons>
        </ProfileContainer>
    );
};

export default ProfilePage;
