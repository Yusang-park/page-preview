import type { PagePreviewEntry } from "@yusang/page-preview/lib";

export const pagePreviewStories: PagePreviewEntry[] = [
  {
    id: "create-artist",
    group: "Sign in",
    name: "Create artist",
    titleKey: "devPageGallery.pages.signup.title",
    descriptionKey: "devPageGallery.pages.signup.description",
    target: {
      path: "/sign-up",
      variantQueryKey: "preview",
      stateQueryKey: "__pp",
    },
    variants: [
      {
        id: "create-artist",
        labelKey: "devPageGallery.variants.createIdle",
        state: {
          zustand: [
            {
              storeId: "signup",
              state: {
                step: "instagram",
                role: "artist",
                chartmetricArtistId: "preview-artist-id",
                name: "Preview Artist",
                email: "preview@example.com",
                localName: "Preview Artist",
              },
            },
          ],
        },
      },
      { id: "create-idle", labelKey: "devPageGallery.variants.createIdle" },
      {
        id: "create-email-sent",
        labelKey: "devPageGallery.variants.createEmailSent",
      },
    ],
  },
];
