import * as React from "react";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import type { Document } from "@contentful/rich-text-types";

import "../styles/components/work-history.css";

type WorkHistoryNode =
  Queries.IndexPageQuery["allContentfulJob"]["nodes"][number];

type WorkHistoryProps = {
  data?: WorkHistoryNode[] | null;
};

const WorkHistory: React.FC<WorkHistoryProps> = ({ data }) => {
  const jobs = Array.isArray(data) ? data : [];
  const [activeTabId, setActiveTabId] = React.useState(0);

  React.useEffect(() => {
    if (activeTabId > jobs.length - 1) {
      setActiveTabId(0);
    }
  }, [activeTabId, jobs.length]);

  if (jobs.length === 0) {
    return (
      <section
        id="work-history"
        className="work-history-section"
        aria-labelledby="work-history-heading"
      >
        <h2 id="work-history-heading" className="work-history-heading">
          Work History
        </h2>

        <small className="work-history-empty">
          TODO: wire Contentful work history
        </small>
      </section>
    );
  }

  return (
    <section
      id="work-history"
      className="work-history-section"
      aria-labelledby="work-history-heading"
    >
      <h2 id="work-history-heading" className="work-history-heading">
        Where I&apos;ve Worked
      </h2>

      <div className="work-history-layout">
        <ul className="work-history-tabs" role="tablist" aria-label="Companies">
          {jobs.map((job, index) => {
            const company = job.company?.trim() || `Company ${index + 1}`;
            const isActive = activeTabId === index;

            return (
              <li key={`${company}-${index}`} className="work-history-tab-item">
                <button
                  type="button"
                  className={`work-history-tab ${isActive ? "is-active" : ""}`}
                  onClick={() => setActiveTabId(index)}
                  role="tab"
                  id={`work-tab-${index}`}
                  aria-selected={isActive}
                  aria-controls={`work-panel-${index}`}
                  tabIndex={isActive ? 0 : -1}
                >
                  {company}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="work-history-panels">
          {jobs.map((job, index) => {
            const isActive = activeTabId === index;
            const company = job.company?.trim() || "";
            const title = job.title?.trim() || "";
            const dateRange = job.dateRange?.trim() || "";
            const companyUrl = getCompanyUrl(job.url?.raw);
            const descriptionContent = getRichTextContent(job.description?.raw);

            return (
              <section
                key={`${company}-${title}-${index}`}
                className={`work-history-panel ${isActive ? "is-active" : ""}`}
                id={`work-panel-${index}`}
                role="tabpanel"
                aria-labelledby={`work-tab-${index}`}
                aria-hidden={!isActive}
              >
                <h3 className="work-history-job-title">
                  {title && <span>{title}</span>}

                  {company && (
                    <span className="work-history-company">
                      <span>&nbsp;@&nbsp;</span>
                      {companyUrl ? (
                        <a
                          href={companyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {company}
                        </a>
                      ) : (
                        <span>{company}</span>
                      )}
                    </span>
                  )}
                </h3>

                {dateRange && (
                  <p className="work-history-job-details">{dateRange}</p>
                )}

                <div className="work-history-description">
                  {descriptionContent
                    ? documentToReactComponents(descriptionContent)
                    : null}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WorkHistory;

const getRichTextContent = (raw?: string | null): Document | null => {
  if (!raw) return null;

  try {
    return JSON.parse(raw) as Document;
  } catch {
    return null;
  }
};

const getCompanyUrl = (raw?: string | null): string | null => {
  if (!raw) return null;

  try {
    const document = JSON.parse(raw) as {
      content?: Array<{
        content?: Array<{
          data?: {
            uri?: string;
          };
        }>;
      }>;
    };

    return document.content?.[0]?.content?.[1]?.data?.uri ?? null;
  } catch {
    return null;
  }
};
