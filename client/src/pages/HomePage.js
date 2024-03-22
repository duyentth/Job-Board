import { useEffect, useState } from "react";
import JobList from "../components/JobList";
import { getJobs } from "../lib/graphql/queries";

function HomePage() {
  const [jobs, setJobs] = useState([]);
  useEffect(() => {
    getJobs()
      .then((resolve) => setJobs(resolve))
      .catch((error) => console.log("error: ", error.message));
  }, []);
  return (
    <div>
      <h1 className="title">Job Board</h1>
      <JobList jobs={jobs} />
    </div>
  );
}

export default HomePage;
