// Platform detection and data extraction
const detectPlatform = () => {
  const hostname = window.location.hostname;
  if (hostname.includes("linkedin.com")) return "LinkedIn";
  if (hostname.includes("naukri.com")) return "Naukri";
  if (hostname.includes("glassdoor.com")) return "Glassdoor";
  if (hostname.includes("indeed.com")) return "Indeed";
  if (hostname.includes("foundit.in")) return "FoundIt";
  if (hostname.includes("cutshort.io")) return "Cutshort";
  return "Other";
};

const extractJobData = () => {
  const platform = detectPlatform();
  let jobTitle = "";
  let companyName = "";
  const jobUrl = window.location.href;

  if (platform === "LinkedIn") {
    const titleEl = document.querySelector(
      ".job-details-jobs-unified-top-card__job-title, .jobs-unified-top-card__job-title, h1.t-24"
    );
    const companyEl = document.querySelector(
      ".job-details-jobs-unified-top-card__company-name, .jobs-unified-top-card__company-name, .job-details-jobs-unified-top-card__primary-description-container a"
    );
    jobTitle = titleEl?.textContent?.trim() || "";
    companyName = companyEl?.textContent?.trim() || "";
  } else if (platform === "Naukri") {
    const titleEl = document.querySelector(".jd-header-title, h1");
    const companyEl = document.querySelector(".jd-header-comp-name, .comp-name a");
    jobTitle = titleEl?.textContent?.trim() || "";
    companyName = companyEl?.textContent?.trim() || "";
  } else if (platform === "Glassdoor") {
    const titleEl = document.querySelector('[data-test="jobTitle"], h1');
    const companyEl = document.querySelector('[data-test="employerName"], .employer-name');
    jobTitle = titleEl?.textContent?.trim() || "";
    companyName = companyEl?.textContent?.trim() || "";
  } else if (platform === "Indeed") {
    const titleEl = document.querySelector(".jobsearch-JobInfoHeader-title, h1[class*='jobTitle']");
    const companyEl = document.querySelector('[data-company-name="true"], [class*="companyName"]');
    jobTitle = titleEl?.textContent?.trim() || "";
    companyName = companyEl?.textContent?.trim() || "";
  } else if (platform === "FoundIt") {
    const titleEl = document.querySelector(".job-title, h1");
    const companyEl = document.querySelector(".company-name, .recruiter-name");
    jobTitle = titleEl?.textContent?.trim() || "";
    companyName = companyEl?.textContent?.trim() || "";
  } else if (platform === "Cutshort") {
    const titleEl = document.querySelector(".job-title, h1");
    const companyEl = document.querySelector(".company-name");
    jobTitle = titleEl?.textContent?.trim() || "";
    companyName = companyEl?.textContent?.trim() || "";
  } else {
    const h1 = document.querySelector("h1");
    jobTitle = h1?.textContent?.trim() || "Job Position";
    companyName = "Company Name";
  }

  return {
    jobTitle,
    companyName,
    platform,
    jobUrl,
  };
};

const createSaveButton = () => {
  if (document.getElementById("job-tracker-save-btn")) {
    return;
  }

  const button = document.createElement("button");
  button.id = "job-tracker-save-btn";
  button.className = "job-tracker-save-button";
  button.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 5V15M5 10H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
    <span>SAVE TO TRACKER</span>
  `;

  button.addEventListener("click", async () => {
    const jobData = extractJobData();

    if (!jobData.jobTitle || !jobData.companyName) {
      alert("Could not extract job details. Please use the extension popup to manually add.");
      return;
    }

    button.disabled = true;
    button.innerHTML = "<span>SAVING...</span>";

    try {
      const result = await chrome.storage.sync.get(["apiUrl"]);
      const apiUrl = result.apiUrl || "http://localhost:8000/api";

      const response = await fetch(`${apiUrl}/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company: jobData.companyName,
          role: jobData.jobTitle,
          platform: jobData.platform,
          status: "Applied",
          jobUrl: jobData.jobUrl,
        }),
      });

      if (response.ok) {
        button.innerHTML = "<span>✓ SAVED!</span>";
        button.classList.add("success");
        setTimeout(() => {
          button.disabled = false;
          button.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 5V15M5 10H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>SAVE TO TRACKER</span>
          `;
          button.classList.remove("success");
        }, 2000);
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      console.error("Error saving job:", error);
      button.innerHTML = "<span>✗ FAILED</span>";
      button.disabled = false;
      setTimeout(() => {
        button.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 5V15M5 10H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span>SAVE TO TRACKER</span>
        `;
      }, 2000);
    }
  });

  document.body.appendChild(button);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", createSaveButton);
} else {
  createSaveButton();
}

const observer = new MutationObserver(() => {
  if (!document.getElementById("job-tracker-save-btn")) {
    createSaveButton();
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
