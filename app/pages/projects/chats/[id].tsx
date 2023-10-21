import Layout from "@/components/layout";
import ProjectChat from "@/components/project/ProjectChat";
import { FullWidthSkeleton } from "@/components/styled";
import { useRouter } from "next/router";

/**
 * Page with a project chat.
 */
export default function Chat() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <Layout maxWidth="sm">
      {id ? <ProjectChat id={id as string} /> : <FullWidthSkeleton />}
    </Layout>
  );
}
