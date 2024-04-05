import {
  createJob,
  deleteJob,
  getJob,
  getJobs,
  getJobsByCompanyId,
  updateJob,
} from "./db/jobs.js";
import { getCompany } from "./db/companies.js";
import { GraphQLError } from "graphql";

export const resolvers = {
  Query: {
    jobs: () => getJobs(),
    job: async (_root, { id }) => {
      const job = await getJob(id);
      if (!job) {
        throw notFoundError(`There is no job with id ${id}`);
      } else return job;
    },
    company: async (_root, { id }) => {
      const company = await getCompany(id);
      if (!company) {
        throw notFoundError(`there is no company with id ${id}`);
      } else return company;
    },
    users: () => [
      { id: 1, name: "duyen" },
      { id: 2, name: "Kelly" },
    ],
  },

  Mutation: {
    createJob: (_root, { input: { title, description } }, context) => {
      const { user } = context;
      if (!user) {
        throw notAuthorized("Missing Authorization");
      }
      const companyId = user.companyId; //TODO set based on User
      return createJob({ companyId, title, description });
    },
    deleteJob: async (_root, { id }, { user }) => {
      if (!user) {
        throw notAuthorized("Missing Authorization");
      }
      const job = await deleteJob(id, user.companyId);
      if (!job) {
        console.log("job: ", job);
        throw notFoundError("No job found with id " + id);
      }
      return job;
    },
    updateJob: async (
      _root,
      { input: { id, title, description } },
      { user }
    ) => {
      if (!user) {
        throw notAuthorized("Missing Authorization");
      }
      const companyId = user.companyId;
      const job = await updateJob({ id, title, description, companyId });
      if (!job) {
        throw notFoundError("No job found with id " + id);
      }
      return job;
    },
  },
  Job: {
    date: (job) => toISOSDate(job.createdAt),
    company: (job, _args, { companyLoader }) =>
      companyLoader.load(job.companyId),
  },
  Company: {
    jobs: (company) => getJobsByCompanyId(company.id),
  },
};
const toISOSDate = (s) => {
  return s.slice(0, "yyyy-mm-dd".length);
};

const notFoundError = (message) => {
  return new GraphQLError(message, { extensions: { code: "NOT_FOUND" } });
};
const notAuthorized = (message) => {
  return new GraphQLError(message, { extensions: { code: "NOT_AUTHORIZED" } });
};
