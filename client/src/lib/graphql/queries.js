import { GraphQLClient, gql } from "graphql-request";
import { getAccessToken } from "../auth";

const client = new GraphQLClient("http://localhost:9000/graphql", {
  headers: () => {
    const accessToken = getAccessToken();
    if (accessToken) {
      return { Authorization: `Bearer ${accessToken}` };
    }
    return {};
  },
});

export const getJobById = async (id) => {
  const query = gql`
    query jobById($jobId: ID!) {
      job(id: $jobId) {
        id
        title
        description
        date
        company {
          id
          name
        }
      }
    }
  `;
  const { job } = await client.request(query, { jobId: id });
  return job;
};

export const getJobs = async () => {
  const query = gql`
    query {
      jobs {
        id
        date
        title
        company {
          id
          name
        }
      }
    }
  `;
  const { jobs } = await client.request(query);
  return jobs;
};

export const getCompanyById = async (id) => {
  const query = gql`
    query company($compId: ID!) {
      company(id: $compId) {
        id
        name
        description
        jobs {
          id
          title
          description
          date
        }
      }
    }
  `;
  const { company } = await client.request(query, { compId: id });
  return company;
};

export const createJob = async (title, description) => {
  const mutation = gql`
    mutation createJob($input: CreateJobInput!) {
      job: createJob(input: $input) {
        id
      }
    }
  `;
  const { job } = await client.request(mutation, {
    input: { title, description },
  });
  return job;
};

export const deletJob = async (id) => {
  const mutation = gql`
    mutation deleteJob($deleteJobId: ID!) {
      job: deleteJob(id: $deleteJobId) {
        id
        title
      }
    }
  `;
  const { job } = await client.request(mutation, { deleteJobId: id });
  console.log(`job deleted: ${job}`);
  return job;
};

export const updateJob = async (id, title, description) => {
  const mutation = gql`
    mutation updateJob($input: UpdateJobInput!) {
      job: updateJob(input: $input) {
        id
      }
    }
  `;
  const { job } = await client.request(mutation, {
    input: { id, title, description },
  });
  console.log(`job updated: ${job}`);
  return job;
};
