import { useState } from "react";
import axios from "axios";
import { Trash, ArrowSquareOut, Funnel } from "@phosphor-icons/react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { API } from "@/api";

const statuses = ["Applied", "Interview", "Rejected", "Offer"];

const statusColors = {
  Applied: "border-violet-200 bg-violet-50 text-violet-900",
  Interview: "border-amber-200 bg-amber-50 text-amber-950",
  Rejected: "border-rose-200 bg-rose-50 text-rose-900",
  Offer: "border-emerald-200 bg-emerald-50 text-emerald-900",
};

const JobTable = ({ jobs, onJobUpdated, onJobDeleted, filters, setFilters, allJobs }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState({});

  const handleStatusChange = async (jobId, newStatus) => {
    setUpdatingStatus({ ...updatingStatus, [jobId]: true });
    try {
      await axios.put(`${API}/jobs/${jobId}`, { status: newStatus });

      if (newStatus === "Offer") {
        toast.success("🎉 Congratulations on the offer!", {
          description: "You got the job!",
        });
      } else {
        toast.success("Status updated successfully");
      }

      onJobUpdated();
    } catch (error) {
      console.error("Error updating job:", error);
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatus({ ...updatingStatus, [jobId]: false });
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/jobs/${jobToDelete}`);
      toast.success("Job deleted successfully");
      onJobDeleted();
      setDeleteDialogOpen(false);
      setJobToDelete(null);
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error("Failed to delete job");
    }
  };

  const uniquePlatforms = [...new Set(allJobs.map((j) => j.platform))];

  return (
    <div
      className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xl shadow-slate-200/50"
      data-testid="job-table-container"
    >
      <div className="border-b border-slate-200/90 bg-slate-50/80 px-5 py-5 backdrop-blur-sm sm:px-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-slate-700">
            <Funnel size={20} weight="duotone" className="text-indigo-500" />
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Filters</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
              <SelectTrigger
                className="h-10 w-[150px] rounded-xl border border-slate-200 bg-white text-sm shadow-sm"
                data-testid="filter-status-select"
              >
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border border-slate-200 shadow-lg">
                <SelectItem value="all">All Status</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.platform} onValueChange={(value) => setFilters({ ...filters, platform: value })}>
              <SelectTrigger
                className="h-10 w-[150px] rounded-xl border border-slate-200 bg-white text-sm shadow-sm"
                data-testid="filter-platform-select"
              >
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border border-slate-200 shadow-lg">
                <SelectItem value="all">All Platforms</SelectItem>
                {uniquePlatforms.map((platform) => (
                  <SelectItem key={platform} value={platform}>
                    {platform}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full" data-testid="job-table">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/90">
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.1em] text-slate-500 sm:px-6">
                Company
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.1em] text-slate-500 sm:px-6">
                Role
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.1em] text-slate-500 sm:px-6">
                Platform
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.1em] text-slate-500 sm:px-6">
                Status
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.1em] text-slate-500 sm:px-6">
                Date
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.1em] text-slate-500 sm:px-6">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job, index) => (
              <tr
                key={job.id}
                className="border-b border-slate-100 transition-colors last:border-b-0 hover:bg-slate-50/60"
                data-testid={`job-row-${index}`}
              >
                <td className="px-5 py-4 font-medium text-slate-900 sm:px-6" data-testid={`job-company-${index}`}>
                  {job.company}
                </td>
                <td className="px-5 py-4 text-slate-700 sm:px-6" data-testid={`job-role-${index}`}>
                  {job.role}
                </td>
                <td className="px-5 py-4 text-sm text-slate-600 sm:px-6" data-testid={`job-platform-${index}`}>
                  {job.platform}
                </td>
                <td className="px-5 py-4 sm:px-6" data-testid={`job-status-${index}`}>
                  <Select
                    value={job.status}
                    onValueChange={(value) => handleStatusChange(job.id, value)}
                    disabled={updatingStatus[job.id]}
                  >
                    <SelectTrigger
                      className={`h-9 w-[130px] rounded-lg border font-semibold text-xs capitalize shadow-sm ${statusColors[job.status]}`}
                      data-testid={`status-dropdown-${index}`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border border-slate-200 shadow-lg">
                      {statuses.map((status) => (
                        <SelectItem
                          key={status}
                          value={status}
                          className="text-sm font-medium capitalize"
                          data-testid={`status-option-${status.toLowerCase()}-${index}`}
                        >
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-5 py-4 text-sm tabular-nums text-slate-600 sm:px-6" data-testid={`job-date-${index}`}>
                  {format(new Date(job.date), "MMM dd, yyyy")}
                </td>
                <td className="px-5 py-4 sm:px-6" data-testid={`job-actions-${index}`}>
                  <div className="flex items-center gap-1">
                    {job.jobUrl && (
                      <a
                        href={job.jobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg p-2 text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700"
                        data-testid={`view-job-link-${index}`}
                      >
                        <ArrowSquareOut size={20} weight="bold" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setJobToDelete(job.id);
                        setDeleteDialogOpen(true);
                      }}
                      className="rounded-lg p-2 text-rose-600 transition hover:bg-rose-50"
                      data-testid={`delete-job-button-${index}`}
                    >
                      <Trash size={20} weight="bold" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent
          className="rounded-2xl border border-slate-200 shadow-2xl shadow-slate-300/40"
          data-testid="delete-confirmation-dialog"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading text-xl font-bold text-slate-900">Delete job?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              This action cannot be undone. This will permanently delete this job application from your tracker.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel
              className="mt-0 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50"
              data-testid="delete-cancel-button"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-xl bg-rose-600 font-semibold text-white hover:bg-rose-500"
              data-testid="delete-confirm-button"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default JobTable;
