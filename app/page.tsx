import XMBScreen from '@/components/XMB/XMBScreen';

export default async function Home(props: PageProps<'/'>) {
  const { project } = await props.searchParams;
  return <XMBScreen initialProject={typeof project === 'string' ? project : undefined} />;
}
