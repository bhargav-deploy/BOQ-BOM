import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        // Access token from middleware
        const token = req.nextauth.token;
        const isAuth = !!token;
        const isLoginPage = req.nextUrl.pathname.startsWith("/login");

        // If on login page and logged in, redirect to dashboard
        if (isLoginPage && isAuth) {
            return NextResponse.redirect(new URL("/", req.url));
        }

        // Role Based Access Control
        // Pricing and Settings are ADMIN only
        if (req.nextUrl.pathname.startsWith("/pricing") || req.nextUrl.pathname.startsWith("/settings")) {
            // @ts-ignore
            if (token?.role !== "ADMIN") {
                return NextResponse.redirect(new URL("/", req.url)); // Or unauthorized page
            }
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token, // Ensure user is logged in for all matched routes
        },
    }
);

export const config = {
    matcher: [
        "/", // Dashboard
        "/pricing/:path*",
        "/quotes/:path*",
        "/customers/:path*",
        "/settings/:path*",
        "/chat/:path*"
    ],
};
