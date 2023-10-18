import AccountProfile from "@/components/account/AccountProfile";
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
    <Layout maxWidth="sm">
      {address ? (
        <AccountProfile address={address as `0x${string}`} />
      ) : (
        <FullWidthSkeleton />
      )}
    </Layout>
  );
}
