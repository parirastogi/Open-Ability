import { redirect } from 'next/navigation';

interface ParamsProps {
  params: Promise<{
    jobId: string;
  }>;
}

export default async function JobDetailRedirectPage({ params }: ParamsProps) {
  const resolvedParams = await params;
  redirect(`/dashboard/jobs/${resolvedParams.jobId}`);
}
