import EntityList from "@/components/entity/EntityList";
import Layout from "@/components/layout";
import { CardBox, MediumLoadingButton } from "@/components/styled";
import { Box, SxProps, Typography } from "@mui/material";
import Link from "next/link";

/**
 * Page with projects.
 */
export default function Projects() {
  return (
    <Layout maxWidth="sm">
      <Typography variant="h4" fontWeight={700} textAlign="center">
        🚀 Projects
      </Typography>
      <Typography textAlign="center" mt={1}>
        you can help create the next big thing
      </Typography>
      <Box display="flex" flexDirection="column" alignItems="center" mt={2}>
        <Link href="/projects/create">
          <MediumLoadingButton variant="outlined">
            Create Project
          </MediumLoadingButton>
        </Link>
      </Box>
      <EntityList
        entities={[]}
        renderEntityCard={(project, index) => <ProjectCard key={index} />}
        noEntitiesText="😐 no project"
        sx={{ mt: 2 }}
      />
    </Layout>
  );
}

function ProjectCard(props: { sx?: SxProps }) {
  return (
    <CardBox sx={{ display: "flex", flexDirection: "row", ...props.sx }}>
      ...
    </CardBox>
  );
}
