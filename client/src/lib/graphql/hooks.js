import { useQuery, useMutation } from "@apollo/client";
import {
  createJobMutation,
  getCompanyByIdQuery,
  getJobByIdQuery,
  getJobsQuery,
} from "./queries";

export const useCompany = (id) => {
  const { data, loading, error } = useQuery(getCompanyByIdQuery, {
    variables: { compId: id },
  });
  return { company: data?.company, loading, error: Boolean(error) };
};
export const useJob = (id) => {
  const { data, loading, error } = useQuery(getJobByIdQuery, {
    variables: { jobId: id },
  });
  return { job: data?.job, loading, error: Boolean(error) };
};

export const useJobs = (limit, offset) => {
  const { data, loading, error } = useQuery(getJobsQuery, {
    variables: { limit, offset },
    fetchPolicy: "network-only",
  });
  return { jobs: data?.jobs, loading, error };
};

export const useCreateJob = () => {
  const [mutate, { loading, error }] = useMutation(createJobMutation);
  const createJob = async (title, description) => {
    const {
      data: { job },
    } = await mutate({
      variables: { input: { title, description } },
      update: (cache, { data }) => {
        cache.writeQuery({
          query: getJobByIdQuery,
          variables: { jobId: data.job.id },
          data,
        });
      },
    });
    return job;
  };

  return { createJob, loading, error };
};
