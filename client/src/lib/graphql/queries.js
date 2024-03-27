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

const apolloClient = new ApolloClient({
  link: concat(authLink, httpLink),
  cache: new InMemoryCache(),
});

const jobDetailFragment = gql`
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
const getJobByIdQuery = gql`
  query jobById($jobId: ID!) {
    job(id: $jobId) {
      ...JobDetail
    }
  }
  ${jobDetailFragment}
`;
export const getJobById = async (id) => {
  const { data } = await apolloClient.query({
    query: getJobByIdQuery,
    variables: { jobId: id },
  });
  return data.job;
};

export const getJobs = async () => {
  const query = gql`
    query {
      jobs {
        ...JobDetail
      }
    }
    ${jobDetailFragment}
  `;
  const { data } = await apolloClient.query({
    query,
    fetchPolicy: "network-only",
  });
  return data.jobs;
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
  const { data } = await apolloClient.query({
    query,
    variables: { compId: id },
  });
  return data.company;
};

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
