import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PROJECTS } from '@/data/projects';
import CaseStudy from '@/components/CaseStudy/CaseStudy';

// Only projects with a case study get a page; anything else 404s
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(PROJECTS).map(slug => ({ slug }));
}

export async function generateMetadata(props: PageProps<'/projects/[slug]'>): Promise<Metadata> {
  const { slug } = await props.params;
  const project = PROJECTS[slug];
  return { title: project ? `${project.title} — Kyle Nicolaou` : 'Kyle Nicolaou' };
}

export default async function ProjectPage(props: PageProps<'/projects/[slug]'>) {
  const { slug } = await props.params;
  const project = PROJECTS[slug];
  if (!project) notFound();
  return <CaseStudy project={project} />;
}
