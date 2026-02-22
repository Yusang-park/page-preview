import { queryClient } from "@/lib/gql/query-client";
import { useSignUpStore } from "@/screens/auth/sign-up/sign-up-store";
import { previewBridge } from "./preview-bridge";

previewBridge.registerZustandStore("signup", useSignUpStore);
previewBridge.registerReactQueryClient("app", queryClient);
