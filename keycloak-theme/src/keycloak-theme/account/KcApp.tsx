import "./KcApp.css";

import { Suspense, lazy } from "react";

import type { KcContext } from "./kcContext";
import type { PageProps } from "keycloakify/account";
import { useI18n } from "./i18n";

const Template = lazy(() => import("./Template"));

const Password = lazy(() => import("./pages/Password"));
const MyExtraPage1 = lazy(() => import("./pages/MyExtraPage1"));
const MyExtraPage2 = lazy(() => import("./pages/MyExtraPage2"));
const Fallback = lazy(() => import("keycloakify/account"));

const classes: PageProps<any, any>["classes"] = {
  kcBodyClass: "my-root-account-class",
  kcButtonDarkPrimaryClass: "my-color my-font",
};

export default function KcApp(props: { kcContext: KcContext }) {
  const { kcContext } = props;

  const i18n = useI18n({ kcContext });

  if (i18n === null) {
    return null;
  }

  return (
    <Suspense>
      {(() => {
        switch (kcContext.pageId) {
          case "password.ftl":
            return (
              <Password
                {...{ kcContext, i18n, Template, classes }}
                doUseDefaultCss={true}
              />
            );
          case "my-extra-page-1.ftl":
            return (
              <MyExtraPage1
                {...{ kcContext, i18n, Template, classes }}
                doUseDefaultCss={true}
              />
            );
          case "my-extra-page-2.ftl":
            return (
              <MyExtraPage2
                {...{ kcContext, i18n, Template, classes }}
                doUseDefaultCss={true}
              />
            );
          default:
            return (
              <Fallback
                {...{ kcContext, i18n, classes }}
                Template={Template}
                doUseDefaultCss={true}
              />
            );
        }
      })()}
    </Suspense>
  );
}
