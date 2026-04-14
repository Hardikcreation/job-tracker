import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Briefcase, Target, UserCheck, XCircle, Trophy, Sparkle } from "@phosphor-icons/react";
import { toast } from "sonner";
import JobTable from "@/components/JobTable";
import AddJobDialog from "@/components/AddJobDialog";
import AnalyticsCard from "@/components/AnalyticsCard";
import { API } from "@/api";

const Dashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [filters, setFilters] = useState({ status: "all", platform: "all" });

  const fetchJobs = async () => {
    try {
      const response = await axios.get(`${API}/jobs`);
      setJobs(response.data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to fetch jobs");
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API}/jobs/analytics`);
      setAnalytics(response.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchJobs(), fetchAnalytics()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleJobAdded = () => {
    fetchJobs();
    fetchAnalytics();
  };

  const handleJobUpdated = () => {
    fetchJobs();
    fetchAnalytics();
  };

  const handleJobDeleted = () => {
    fetchJobs();
    fetchAnalytics();
  };

  const filteredJobs = jobs.filter((job) => {
    const statusMatch = filters.status === "all" || job.status === filters.status;
    const platformMatch = filters.platform === "all" || job.platform === filters.platform;
    return statusMatch && platformMatch;
  });

  if (loading) {
    return (
      <div
        className="relative flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-b from-slate-50 via-white to-slate-100/90"
        data-testid="loading-state"
      >
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-32 right-0 h-72 w-72 rounded-full bg-indigo-200/35 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-violet-200/30 blur-3xl" />
        </div>
        <div
          className="h-11 w-11 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600"
          aria-hidden
        />
        <p className="text-sm font-medium text-slate-600">Loading applications…</p>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100/80"
      data-testid="dashboard"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-indigo-200/30 blur-3xl" />
        <div className="absolute top-[40%] -left-32 h-80 w-80 rounded-full bg-violet-200/25 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-cyan-100/40 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-12 lg:px-8">
        <header className="mb-10 flex flex-col gap-8 lg:mb-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/80 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-900">
              <Sparkle size={14} weight="fill" className="text-indigo-500" aria-hidden />
              Application pipeline
            </span>
            <div>
              <h1
                className="font-heading text-4xl font-bold tracking-tight text-slate-900 md:text-5xl"
                data-testid="dashboard-title"
              >
                Job tracker
              </h1>
              <p className="mt-3 text-base leading-relaxed text-slate-600 md:text-lg" data-testid="dashboard-subtitle">
                Monitor every application, interview, and offer from one calm dashboard.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowAddDialog(true)}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:scale-[0.98]"
            data-testid="add-job-button"
          >
            <Plus size={20} weight="bold" aria-hidden />
            Add job
          </button>
        </header>

        {analytics && (
          <section className="mb-10 lg:mb-12" data-testid="analytics-section">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Overview</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <AnalyticsCard
                icon={<Briefcase size={22} weight="fill" />}
                label="Total"
                value={analytics.total}
                accent="slate"
                testId="analytics-total"
              />
              <AnalyticsCard
                icon={<Target size={22} weight="fill" />}
                label="Applied"
                value={analytics.applied}
                accent="violet"
                testId="analytics-applied"
              />
              <AnalyticsCard
                icon={<UserCheck size={22} weight="fill" />}
                label="Interview"
                value={analytics.interview}
                accent="amber"
                testId="analytics-interview"
              />
              <AnalyticsCard
                icon={<Trophy size={22} weight="fill" />}
                label="Offer"
                value={analytics.offer}
                accent="emerald"
                testId="analytics-offer"
              />
              <AnalyticsCard
                icon={<XCircle size={22} weight="fill" />}
                label="Rejected"
                value={analytics.rejected}
                accent="rose"
                testId="analytics-rejected"
              />
            </div>
          </section>
        )}

        {jobs.length === 0 ? (
          <div
            className="mx-auto max-w-lg rounded-3xl border border-slate-200/90 bg-white/80 p-10 text-center shadow-xl shadow-slate-200/40 backdrop-blur-sm md:p-14"
            data-testid="empty-state"
          >
            <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100">
              <Briefcase size={52} weight="duotone" className="text-indigo-600" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-slate-900">Start your search</h2>
            <p className="mt-2 text-slate-600">
              No applications yet. Add your first role to track status, links, and dates in one place.
            </p>
            <button
              type="button"
              onClick={() => setShowAddDialog(true)}
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              data-testid="empty-add-job-button"
            >
              <Plus size={20} weight="bold" aria-hidden />
              Add your first job
            </button>
          </div>
        ) : (
          <JobTable
            jobs={filteredJobs}
            onJobUpdated={handleJobUpdated}
            onJobDeleted={handleJobDeleted}
            filters={filters}
            setFilters={setFilters}
            allJobs={jobs}
          />
        )}
      </div>

      <AddJobDialog open={showAddDialog} onOpenChange={setShowAddDialog} onJobAdded={handleJobAdded} />
    </div>
  );
};

export default Dashboard;
