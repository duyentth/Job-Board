import {
  ApolloClient,
  gql,
  InMemoryCache,
  ApolloLink,
  createHttpLink,
  concat,
} from "@apollo/client";
import { getAccessToken } from "../auth";

const httpLink = createHttpLink({ uri: "http://localhost:9000/graphql" });
const authLink = new ApolloLink((operation, forward) => {
  const accessToken = getAccessToken();
  if (accessToken) {
    operation.setContext({
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }
  return forward(operation);
});

export const apolloClient = new ApolloClient({
  link: concat(authLink, httpLink),
  cache: new InMemoryCache(),
});

export const jobDetailFragment = gql`
  fragment JobDetail on Job {
    id
    title
    description
    date
    company {
      id
      name
    }
  }
`;
export const getJobByIdQuery = gql`
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
export const getCompanyByIdQuery = gql`
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
export const getJobsQuery = gql`
  query Jobs($limit: Int, $offset: Int) {
    jobs(limit: $limit, offset: $offset) {
      items {
        id
        title
        description
        date
        company {
          id
          name
        }
      }
      totalCount
    }
  }
`;
export const createJobMutation = gql`
  mutation createJob($input: CreateJobInput!) {
    job: createJob(input: $input) {
      ...JobDetail
    }
  }
  ${jobDetailFragment}
`;
export const createJob = async (title, description) => {
  const mutation = gql`
    mutation createJob($input: CreateJobInput!) {
      job: createJob(input: $input) {
        id
        date
        title
        description
        company {
          id
          name
        }
      }
    }
  `;
  const { data } = await apolloClient.mutate({
    mutation,
    variables: { input: { title, description } },
    update: (cache, { data }) => {
      console.log("data: ", data);
      cache.writeQuery({
        query: getJobByIdQuery,
        variables: { jobId: data.job.id },
        data,
      });
    },
  });
  return data.job;
};

export const deleteJob = async (id) => {
  const mutation = gql`
    mutation deleteJob($deleteJobId: ID!) {
      job: deleteJob(id: $deleteJobId) {
        id
        title
      }
    }
  `;
  const { data } = apolloClient.mutate({
    mutation,
    variables: { deletJob: id },
  });

  return data.job;
};

export const updateJob = async (id, title, description) => {
  const mutation = gql`
    mutation updateJob($input: UpdateJobInput!) {
      job: updateJob(input: $input) {
        id
      }
    }
  `;

  const { data } = apolloClient.mutate({
    mutation,
    variables: { input: { id, title, description } },
  });
  return data.job;
};
