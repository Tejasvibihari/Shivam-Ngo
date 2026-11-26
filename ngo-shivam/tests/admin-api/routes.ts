import "./env";
import * as login from "@/app/api/admin/auth/login/route";
import * as logout from "@/app/api/admin/auth/logout/route";
import * as me from "@/app/api/admin/auth/me/route";
import * as password from "@/app/api/admin/auth/password/route";
import * as profile from "@/app/api/admin/auth/profile/route";
import * as signup from "@/app/api/admin/auth/signup/route";
import * as setup from "@/app/api/admin/setup/route";
import * as pin from "@/app/api/admin/settings/signup-pin/route";
import * as stats from "@/app/api/admin/stats/route";
import * as users from "@/app/api/admin/users/route";

export const routes = { login, logout, me, password, profile, signup, setup, pin, stats, users };

export const PATHS = {
    login: "/api/admin/auth/login",
    logout: "/api/admin/auth/logout",
    me: "/api/admin/auth/me",
    password: "/api/admin/auth/password",
    profile: "/api/admin/auth/profile",
    signup: "/api/admin/auth/signup",
    setup: "/api/admin/setup",
    pin: "/api/admin/settings/signup-pin",
    stats: "/api/admin/stats",
    users: "/api/admin/users",
} as const;
