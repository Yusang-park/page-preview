import { queryClient } from "@/lib/gql/query-client";
import { useSignUpStore } from "@/screens/auth/sign-up/sign-up-store";
import {
  registerReactQueryClient,
  registerZustandStore,
} from "@/dev/page-preview-bridge";

registerZustandStore("signup", useSignUpStore as unknown as Parameters<typeof registerZustandStore>[1]);
registerReactQueryClient("app", queryClient);
