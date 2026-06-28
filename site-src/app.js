const filters = document.querySelectorAll("[data-filter]");
const cards = document.querySelectorAll("[data-tags]");

filters.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filters.forEach((item) => item.classList.toggle("active", item === button));
    cards.forEach((card) => {
      const tags = card.dataset.tags.split("|");
      card.classList.toggle("hidden", filter !== "all" && !tags.includes(filter));
    });
  });
});

const progress = document.querySelector("[data-progress]");
if (progress) {
  const updateProgress = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${Math.max(0, Math.min(1, scrollTop / max)) * 100}%`;
  };
  document.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();
}

const trainingForm = document.querySelector("[data-training-form]");
if (trainingForm) {
  trainingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(trainingForm);
    const recipient = trainingForm.dataset.mailto || "hello@sansara.yoga";
    const subject = "Sansara teacher workshop inquiry";
    const body = [
      `Name: ${formData.get("name") || ""}`,
      `Email: ${formData.get("email") || ""}`,
      `Teaching background: ${formData.get("background") || ""}`,
      "",
      "Message:",
      formData.get("message") || "",
    ].join("\n");
    window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}
