import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    /*
      Protect everything except:
      /login, /signup, /_next/static, /_next/image, favicon, public assets
    */
    "/((?!login|signup|_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
