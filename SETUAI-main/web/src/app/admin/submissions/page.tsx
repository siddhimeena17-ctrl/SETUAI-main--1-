import { AdminMutationButton } from "@/components/admin-actions";
import { AdminShell } from "@/components/admin-shell";
import { requireAdminPage } from "@/lib/admin-auth";
import { getSubmissions } from "@/lib/cms";
import { formspreeProjectUrl } from "@/lib/formspree";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Admin Submissions",
  description: "Review SetuAI website form submissions.",
  path: "/admin/submissions",
});

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export default async function AdminSubmissionsPage() {
  await requireAdminPage("/admin/submissions");
  const submissions = await getSubmissions();

  return (
    <AdminShell active="submissions" title="Submissions" description="Review inquiries, chapter applications, and beta requests. Email status means provider acceptance, not confirmed inbox delivery.">
      <p className="mb-6 text-sm leading-7">
        New inquiries and applications are saved in <a className="underline underline-offset-4" href={formspreeProjectUrl} target="_blank" rel="noopener noreferrer">the SetuAI Formspree project</a>. Previously saved inquiries remain below.
      </p>
      {submissions.length ? (
        <div className="grid gap-4">
          {submissions.map((submission) => (
            <article key={submission.id} className="rounded-md border border-[#e4d9dc] bg-white p-5">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-black text-[#2a1b22]">{submission.name}</h2>
                    {!submission.read ? <span className="rounded-md bg-[#f7edf1] px-2 py-1 text-xs font-black text-[#9f0038]">Unread</span> : null}
                    <span className="rounded-md bg-[#eef3f4] px-2 py-1 text-xs font-black text-[#33565e]">{submission.status || "new"}</span>
                  </div>
                  <p className="mt-1 text-sm font-bold text-[#7b6a70]">{submission.email}</p>
                  <p className="mt-1 text-sm font-bold text-[#7b6a70]">{submission.organization}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-[#f7eef1] px-3 py-2 text-sm font-black text-[#4a0018]">{submission.formType}</span>
                  {!submission.read ? <AdminMutationButton label="Mark read" endpoint={`/api/admin/submissions/${submission.id}`} /> : null}
                  {(submission.status || "new") === "new" ? <AdminMutationButton label="Start" endpoint={`/api/admin/submissions/${submission.id}`} body={{ status: "in-progress", read: true }} /> : null}
                  {(submission.status || "new") === "in-progress" ? <AdminMutationButton label="Close" endpoint={`/api/admin/submissions/${submission.id}`} body={{ status: "closed", read: true }} /> : null}
                </div>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm"><strong>Email notification: {submission.notificationStatus || "not recorded"}</strong>{submission.notificationStatus !== "sent" ? <AdminMutationButton label="Retry notification" method="POST" endpoint={`/api/admin/submissions/${submission.id}/notify`} /> : null}</div>
              {submission.notificationError ? <p className="mt-2 text-sm text-red-800">{submission.notificationError}</p> : null}
              <p className="mt-3 text-sm">Source: {submission.sourcePage || "Not recorded"}</p>
              <dl className="mt-4 grid gap-3">{Object.entries(submission.fields || {}).map(([key, value]) => <div key={key}><dt className="font-semibold">{key}</dt><dd className="whitespace-pre-wrap text-sm leading-6">{value}</dd></div>)}</dl>
              <p className="mt-4 text-sm font-black text-[#2a1b22]">{submission.interest}</p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#5e5055]">{submission.message}</p>
              <p className="mt-4 text-xs font-bold text-[#7b6a70]">Privacy notice acknowledged: {submission.privacyAcknowledged ? "yes" : "not recorded"}. Updates requested: {submission.updatesOptIn ? "yes, confirmation required" : "no"}.</p>
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-[#7b6a70]">{formatDate(submission.createdAt)}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-[#e4d9dc] bg-white px-5 py-20 text-center">
          <p className="text-sm font-medium text-[#7b6a70]">No messages yet.</p>
        </div>
      )}
    </AdminShell>
  );
}
