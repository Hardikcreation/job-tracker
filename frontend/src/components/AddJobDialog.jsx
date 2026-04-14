import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { API } from "@/api";

const platforms = [
  "LinkedIn",
  "Naukri",
  "Glassdoor",
  "Indeed",
  "FoundIt",
  "Cutshort",
  "Other",
];

const statuses = ["Applied", "Interview", "Rejected", "Offer"];

const AddJobDialog = ({ open, onOpenChange, onJobAdded }) => {
  const [formData, setFormData] = useState({
    company: "",
    role: "",
    platform: "LinkedIn",
    status: "Applied",
    jobUrl: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.company || !formData.role) {
      toast.error("Company and Role are required");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API}/jobs`, formData);
      toast.success("Job added successfully!");
      setFormData({
        company: "",
        role: "",
        platform: "LinkedIn",
        status: "Applied",
        jobUrl: "",
      });
      onOpenChange(false);
      onJobAdded();
    } catch (error) {
      console.error("Error adding job:", error);
      toast.error("Failed to add job");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-2 border-black shadow-brutal-lg sm:max-w-[500px]" data-testid="add-job-dialog">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading font-black uppercase tracking-tighter">
            ADD NEW JOB
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="company" className="font-body font-bold uppercase text-xs">
              COMPANY *
            </Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="border-2 border-black focus:ring-0 focus:border-black mt-1"
              placeholder="e.g., Google"
              data-testid="company-input"
            />
          </div>
          <div>
            <Label htmlFor="role" className="font-body font-bold uppercase text-xs">
              ROLE *
            </Label>
            <Input
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="border-2 border-black focus:ring-0 focus:border-black mt-1"
              placeholder="e.g., Senior Software Engineer"
              data-testid="role-input"
            />
          </div>
          <div>
            <Label htmlFor="platform" className="font-body font-bold uppercase text-xs">
              PLATFORM
            </Label>
            <Select
              value={formData.platform}
              onValueChange={(value) => setFormData({ ...formData, platform: value })}
            >
              <SelectTrigger className="border-2 border-black focus:ring-0 mt-1" data-testid="platform-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-2 border-black">
                {platforms.map((platform) => (
                  <SelectItem
                    key={platform}
                    value={platform}
                    data-testid={`platform-option-${platform.toLowerCase()}`}
                  >
                    {platform}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="status" className="font-body font-bold uppercase text-xs">
              STATUS
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger className="border-2 border-black focus:ring-0 mt-1" data-testid="status-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-2 border-black">
                {statuses.map((status) => (
                  <SelectItem
                    key={status}
                    value={status}
                    data-testid={`status-option-${status.toLowerCase()}`}
                  >
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="jobUrl" className="font-body font-bold uppercase text-xs">
              JOB URL
            </Label>
            <Input
              id="jobUrl"
              value={formData.jobUrl}
              onChange={(e) => setFormData({ ...formData, jobUrl: e.target.value })}
              className="border-2 border-black focus:ring-0 focus:border-black mt-1"
              placeholder="https://..."
              data-testid="job-url-input"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="btn-brutal bg-white px-6 py-2 flex-1"
              data-testid="cancel-button"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-brutal bg-brutal-yellow px-6 py-2 flex-1 disabled:opacity-50"
              data-testid="submit-button"
            >
              {submitting ? "SAVING..." : "ADD JOB"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddJobDialog;
