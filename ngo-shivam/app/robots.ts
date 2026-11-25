import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** Served at /robots.txt */
export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                // the form endpoint is not a page, and the admin panel is private
                disallow: ["/api/", "/admin"],
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}
