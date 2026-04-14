chrome.storage.sync.get(["apiUrl"], (result) => {
  if (result.apiUrl) {
    document.getElementById("apiUrl").value = result.apiUrl;
  }
});

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (!tabs[0]?.id) return;
  chrome.scripting.executeScript(
    {
      target: { tabId: tabs[0].id },
      func: extractPageData,
    },
    (results) => {
      if (results && results[0] && results[0].result) {
        const data = results[0].result;
        if (data.jobTitle) document.getElementById("role").value = data.jobTitle;
        if (data.companyName) document.getElementById("company").value = data.companyName;
        if (data.platform) document.getElementById("platform").value = data.platform;
        if (data.jobUrl) document.getElementById("jobUrl").value = data.jobUrl;
      }
    }
  );
});

function extractPageData() {
  const hostname = window.location.hostname;
  let platform = "Other";

  if (hostname.includes("linkedin.com")) platform = "LinkedIn";
  else if (hostname.includes("naukri.com")) platform = "Naukri";
  else if (hostname.includes("glassdoor.com")) platform = "Glassdoor";
  else if (hostname.includes("indeed.com")) platform = "Indeed";
  else if (hostname.includes("foundit.in")) platform = "FoundIt";
  else if (hostname.includes("cutshort.io")) platform = "Cutshort";

  let jobTitle = "";
  let companyName = "";

  const h1 = document.querySelector("h1");
  if (h1) jobTitle = h1.textContent.trim();

  return {
    jobTitle,
    companyName,
    platform,
    jobUrl: window.location.href,
  };
}

document.getElementById("saveSettings").addEventListener("click", () => {
  const apiUrl = document.getElementById("apiUrl").value;
  chrome.storage.sync.set({ apiUrl }, () => {
    showMessage("Settings saved!", "success");
  });
});

document.getElementById("jobForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const submitBtn = document.getElementById("submitBtn");
  const company = document.getElementById("company").value;
  const role = document.getElementById("role").value;
  const platform = document.getElementById("platform").value;
  const jobUrl = document.getElementById("jobUrl").value;

  submitBtn.disabled = true;
  submitBtn.textContent = "SAVING...";

  try {
    const result = await chrome.storage.sync.get(["apiUrl"]);
    const apiUrl = result.apiUrl || "http://localhost:8000/api";

    const payload = {
      company,
      role,
      platform,
      status: "Applied",
    };
    if (jobUrl) payload.jobUrl = jobUrl;

    const response = await fetch(`${apiUrl}/jobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      showMessage("Job added successfully! ✓", "success");
      document.getElementById("jobForm").reset();
    } else {
      throw new Error("Failed to add job");
    }
  } catch (error) {
    console.error("Error:", error);
    showMessage("Failed to add job. Check API URL in settings.", "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "ADD JOB";
  }
});

function showMessage(text, type) {
  const message = document.getElementById("message");
  message.textContent = text;
  message.className = `message ${type}`;

  setTimeout(() => {
    message.classList.add("hidden");
  }, 3000);
}
