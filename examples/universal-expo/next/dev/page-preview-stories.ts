import type { PagePreviewEntry } from "page-preview-lab/lib";

export const pagePreviewStories: PagePreviewEntry[] = [
  {
    id: "create-artist",
    group: "Sign in",
    name: "Create artist",
    target: {
      path: "/sign-up",
      variantQueryKey: "preview",
      stateQueryKey: "__pp",
    },
    variants: [
      {
        id: "create-artist",
        label: "devPageGallery.variants.createIdle",
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
      { id: "create-idle", label: "devPageGallery.variants.createIdle" },
      {
        id: "create-email-sent",
        label: "devPageGallery.variants.createEmailSent",
      },
    ],
  },
];
