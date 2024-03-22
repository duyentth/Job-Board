import { useParams } from "react-router";
import { useEffect, useState } from "react";
import { getCompanyById } from "../lib/graphql/queries";
import JobList from "../components/JobList";

function CompanyPage() {
  const { companyId } = useParams();
  const [state, setState] = useState({
    loading: true,
    company: null,
    error: false,
  });
  useEffect(() => {
    (async () => {
      try {
        const retCompany = await getCompanyById(companyId);
        setState({ loading: false, company: retCompany, error: false });
      } catch (error) {
        console.log(error);
        setState({ loading: false, company: null, error: true });
      }
    })();
  }, [companyId]);
  const { loading, company, error } = state;
  if (loading) return <div>Loading....</div>;
  if (error) {
    return <div className="has-text-danger">Data Unavailable</div>;
  }
  return (
    <div>
      <h1 className="title">{company.name}</h1>
      <div className="box">{company.description}</div>
      <h2 className="title is-5">Jobs availabel at {company.name}</h2>
      <JobList jobs={company.jobs} />
    </div>
  );
}

export default CompanyPage;
