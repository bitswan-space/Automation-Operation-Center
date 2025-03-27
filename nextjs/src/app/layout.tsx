import ReactQueryProvider from "@/context/ReactQueryProvider";
import "@/styles/globals.css";
import "reactflow/dist/base.css";

import { GeistSans } from "geist/font/sans";

import { type Metadata } from "next";
import FlowProvider from "@/context/ReactFlowProvider";
import { SessionProvider } from "next-auth/react";
import { auth, signOut } from "@/server/auth";
import { keyCloakSessionLogOut } from "@/utils/keycloak";

export const metadata: Metadata = {
  title: "Bitswan A.O.C",
  description: "Bitswan Automations Operation Center",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  if (!session) {
    keyCloakSessionLogOut()
      .then((_) => {
        signOut({ redirectTo: "/" })
          .then((res) => console.info(res))
          .catch((error: Error) => {
            console.log("signOut error:", error);
          });
      })
      .catch((error: Error) => {
        console.log("keyCloakSessionLogOut error:", error);
      });
  }

  console.log("session", session);

  return (
    <SessionProvider session={session}>
      <ReactQueryProvider>
        <FlowProvider>
          <html lang="en" className={`${GeistSans.variable} bg-neutral-200/50`}>
            <body className="">
              <main>{children}</main>
            </body>
          </html>
        </FlowProvider>
      </ReactQueryProvider>
    </SessionProvider>
  );
}
