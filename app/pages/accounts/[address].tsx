import Layout from "@/components/layout";
import { FullWidthSkeleton } from "@/components/styled";
import { useRouter } from "next/router";

/**
 * Page with an account.
 */
export default function Account() {
  const router = useRouter();
  const { address } = router.query;

  return (
    <Layout maxWidth="sm">{address ? <>...</> : <FullWidthSkeleton />}</Layout>
  );
}
